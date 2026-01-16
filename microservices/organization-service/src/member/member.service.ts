import { Injectable, NotFoundException, ForbiddenException, ConflictException, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto, UpdateMemberDto, QueryMembersDto } from './dto';

@Injectable()
export class MemberService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async findAll(organizationId: string, query: QueryMembersDto) {
    const where: any = { organizationId };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.organizationMember.findMany({
      where,
      include: { role: true },
      orderBy: [{ role: { hierarchyLevel: 'desc' } }, { name: 'asc' }],
    });
  }

  async findOne(organizationId: string, id: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { id, organizationId },
      include: { role: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async findByUser(organizationId: string, userId: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId },
      include: { role: true },
    });

    if (!member) {
      throw new NotFoundException(`User is not a member of this organization`);
    }

    return member;
  }

  async add(organizationId: string, addDto: AddMemberDto, requestingUserId: string) {
    await this.requirePermission(organizationId, requestingUserId, 'users:manage');

    // Check if user is already a member
    const existing = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId: addDto.userId },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Verify role exists and belongs to org
    const role = await this.prisma.organizationRole.findFirst({
      where: { id: addDto.roleId, organizationId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Cannot assign owner role
    if (role.name === 'owner') {
      throw new ForbiddenException('Cannot assign owner role');
    }

    // Check subscription limits
    await this.checkMemberLimit(organizationId);

    const member = await this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: addDto.userId,
        roleId: addDto.roleId,
        email: addDto.email,
        name: addDto.name,
        avatar: addDto.avatar,
        invitedBy: requestingUserId,
      },
      include: { role: true },
    });

    // Update subscription usage
    await this.prisma.subscription.updateMany({
      where: { organizationId },
      data: { usedUsers: { increment: 1 } },
    });

    // Emit event
    this.kafkaClient.emit('organization.member.added', {
      organizationId,
      memberId: member.id,
      userId: addDto.userId,
      addedBy: requestingUserId,
    });

    return member;
  }

  async update(organizationId: string, id: string, updateDto: UpdateMemberDto, requestingUserId: string) {
    await this.requirePermission(organizationId, requestingUserId, 'users:manage');

    const member = await this.findOne(organizationId, id);

    // Cannot modify owner
    if (member.role.name === 'owner') {
      throw new ForbiddenException('Cannot modify owner member');
    }

    // Verify new role if provided
    if (updateDto.roleId) {
      const role = await this.prisma.organizationRole.findFirst({
        where: { id: updateDto.roleId, organizationId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      if (role.name === 'owner') {
        throw new ForbiddenException('Cannot assign owner role');
      }
    }

    return this.prisma.organizationMember.update({
      where: { id },
      data: updateDto,
      include: { role: true },
    });
  }

  async updateRole(organizationId: string, id: string, roleId: string, requestingUserId: string) {
    await this.requirePermission(organizationId, requestingUserId, 'users:manage');

    const member = await this.findOne(organizationId, id);

    // Cannot change owner's role
    if (member.role.name === 'owner') {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Verify new role
    const role = await this.prisma.organizationRole.findFirst({
      where: { id: roleId, organizationId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.name === 'owner') {
      throw new ForbiddenException('Cannot assign owner role');
    }

    return this.prisma.organizationMember.update({
      where: { id },
      data: { roleId },
      include: { role: true },
    });
  }

  async deactivate(organizationId: string, id: string, requestingUserId: string) {
    await this.requirePermission(organizationId, requestingUserId, 'users:manage');

    const member = await this.findOne(organizationId, id);

    // Cannot deactivate owner
    if (member.role.name === 'owner') {
      throw new ForbiddenException('Cannot deactivate owner');
    }

    // Cannot deactivate self
    if (member.userId === requestingUserId) {
      throw new ForbiddenException('Cannot deactivate yourself');
    }

    return this.prisma.organizationMember.update({
      where: { id },
      data: { isActive: false },
      include: { role: true },
    });
  }

  async reactivate(organizationId: string, id: string, requestingUserId: string) {
    await this.requirePermission(organizationId, requestingUserId, 'users:manage');

    // Check subscription limits before reactivating
    await this.checkMemberLimit(organizationId);

    return this.prisma.organizationMember.update({
      where: { id },
      data: { isActive: true },
      include: { role: true },
    });
  }

  async remove(organizationId: string, id: string, requestingUserId: string) {
    await this.requirePermission(organizationId, requestingUserId, 'users:manage');

    const member = await this.findOne(organizationId, id);

    // Cannot remove owner
    if (member.role.name === 'owner') {
      throw new ForbiddenException('Cannot remove owner from organization');
    }

    // Cannot remove self
    if (member.userId === requestingUserId) {
      throw new ForbiddenException('Cannot remove yourself. Use leave organization instead.');
    }

    await this.prisma.organizationMember.delete({ where: { id } });

    // Update subscription usage
    await this.prisma.subscription.updateMany({
      where: { organizationId },
      data: { usedUsers: { decrement: 1 } },
    });

    // Emit event
    this.kafkaClient.emit('organization.member.removed', {
      organizationId,
      memberId: id,
      userId: member.userId,
      removedBy: requestingUserId,
    });

    return { success: true };
  }

  private async checkMemberLimit(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (subscription && subscription.usedUsers >= subscription.maxUsers) {
      throw new ForbiddenException(
        `Member limit reached (${subscription.maxUsers}). Upgrade your plan to add more members.`
      );
    }
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
