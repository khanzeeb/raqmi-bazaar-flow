import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteDto, AcceptInviteDto, QueryInvitesDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async findAll(organizationId: string, query: QueryInvitesDto) {
    const where: any = { organizationId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }

    return this.prisma.organizationInvite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.organizationInvite.findMany({
      where: {
        email: { equals: email, mode: 'insensitive' },
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(organizationId: string, createDto: CreateInviteDto, inviterId: string, inviterName?: string) {
    await this.requirePermission(organizationId, inviterId, 'users:invite');

    // Check if already a member
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: { organizationId, email: { equals: createDto.email, mode: 'insensitive' } },
    });
    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Check for existing pending invite
    const existingInvite = await this.prisma.organizationInvite.findFirst({
      where: {
        organizationId,
        email: { equals: createDto.email, mode: 'insensitive' },
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvite) {
      throw new ConflictException('An invite is already pending for this email');
    }

    // Verify role exists
    const role = await this.prisma.organizationRole.findFirst({
      where: { organizationId, name: createDto.roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role "${createDto.roleName}" not found`);
    }
    if (role.name === 'owner') {
      throw new ForbiddenException('Cannot invite with owner role');
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.prisma.organizationInvite.create({
      data: {
        organizationId,
        email: createDto.email,
        roleName: createDto.roleName,
        invitedBy: inviterId,
        invitedByName: inviterName,
        token,
        expiresAt,
      },
    });

    // Emit event for email notification
    this.kafkaClient.emit('organization.invite.created', {
      inviteId: invite.id,
      organizationId,
      email: createDto.email,
      roleName: createDto.roleName,
      token,
      expiresAt,
    });

    return invite;
  }

  async getByToken(token: string) {
    const invite = await this.prisma.organizationInvite.findUnique({
      where: { token },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invite has already been ${invite.status.toLowerCase()}`);
    }

    if (invite.expiresAt < new Date()) {
      await this.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invite has expired');
    }

    return invite;
  }

  async accept(acceptDto: AcceptInviteDto) {
    const invite = await this.getByToken(acceptDto.token);

    // Check subscription limits
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: invite.organizationId },
    });
    if (subscription && subscription.usedUsers >= subscription.maxUsers) {
      throw new ForbiddenException('Organization has reached its member limit');
    }

    // Get role
    const role = await this.prisma.organizationRole.findFirst({
      where: { organizationId: invite.organizationId, name: invite.roleName },
    });
    if (!role) {
      throw new NotFoundException('Role no longer exists');
    }

    // Create member and update invite in transaction
    const member = await this.prisma.$transaction(async (tx) => {
      // Check if already a member
      const existing = await tx.organizationMember.findFirst({
        where: { organizationId: invite.organizationId, userId: acceptDto.userId },
      });
      if (existing) {
        throw new ConflictException('You are already a member of this organization');
      }

      // Create member
      const newMember = await tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: acceptDto.userId,
          roleId: role.id,
          email: invite.email,
          name: acceptDto.userName,
          avatar: acceptDto.userAvatar,
          invitedBy: invite.invitedBy,
        },
        include: { role: true, organization: true },
      });

      // Update invite status
      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      // Update subscription usage
      await tx.subscription.updateMany({
        where: { organizationId: invite.organizationId },
        data: { usedUsers: { increment: 1 } },
      });

      return newMember;
    });

    // Emit event
    this.kafkaClient.emit('organization.invite.accepted', {
      inviteId: invite.id,
      organizationId: invite.organizationId,
      memberId: member.id,
      userId: acceptDto.userId,
    });

    return member;
  }

  async cancel(organizationId: string, id: string, userId: string) {
    await this.requirePermission(organizationId, userId, 'users:invite');

    const invite = await this.prisma.organizationInvite.findFirst({
      where: { id, organizationId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending invites');
    }

    await this.prisma.organizationInvite.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return { success: true };
  }

  async resend(organizationId: string, id: string, userId: string) {
    await this.requirePermission(organizationId, userId, 'users:invite');

    const invite = await this.prisma.organizationInvite.findFirst({
      where: { id, organizationId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Can only resend pending invites');
    }

    // Generate new token and extend expiry
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.organizationInvite.update({
      where: { id },
      data: { token, expiresAt },
    });

    // Emit event for email notification
    this.kafkaClient.emit('organization.invite.resent', {
      inviteId: id,
      organizationId,
      email: invite.email,
      token,
      expiresAt,
    });

    return updated;
  }

  private async requirePermission(organizationId: string, userId: string, permission: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId, isActive: true },
      include: { role: true },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const permissions = member.role.permissions as string[];
    if (!permissions.includes(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }
}
