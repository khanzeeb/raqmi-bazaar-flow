import { Injectable, NotFoundException, ForbiddenException, ConflictException, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto';
import { DEFAULT_ROLES } from '../role/constants';

@Injectable()
export class OrganizationService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('organization.created');
    await this.kafkaClient.connect();
  }

  async create(createDto: CreateOrganizationDto) {
    // Check slug uniqueness
    const existingSlug = await this.prisma.organization.findUnique({
      where: { slug: createDto.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Organization slug already exists');
    }

    // Create organization with default roles and owner member in transaction
    const organization = await this.prisma.$transaction(async (tx) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: createDto.name,
          slug: createDto.slug,
          logo: createDto.logo,
          industry: createDto.industry,
          taxNumber: createDto.taxNumber,
          currency: createDto.currency || 'USD',
          timezone: createDto.timezone || 'UTC',
          language: createDto.language || 'en',
          addressStreet: createDto.addressStreet,
          addressCity: createDto.addressCity,
          addressState: createDto.addressState,
          addressCountry: createDto.addressCountry,
          addressPostal: createDto.addressPostal,
          defaultTaxRate: createDto.defaultTaxRate || 0,
          invoicePrefix: createDto.invoicePrefix || 'INV-',
          quotationPrefix: createDto.quotationPrefix || 'QT-',
          expensePrefix: createDto.expensePrefix || 'EXP-',
          purchasePrefix: createDto.purchasePrefix || 'PO-',
          fiscalYearStart: createDto.fiscalYearStart || 1,
        },
      });

      // Create default roles
      const roles = await Promise.all(
        DEFAULT_ROLES.map((role) =>
          tx.organizationRole.create({
            data: {
              organizationId: org.id,
              name: role.name,
              displayName: role.displayName,
              displayNameAr: role.displayNameAr,
              description: role.description,
              descriptionAr: role.descriptionAr,
              hierarchyLevel: role.hierarchyLevel,
              isSystem: true,
              permissions: role.permissions,
            },
          })
        )
      );

      // Find owner role
      const ownerRole = roles.find((r) => r.name === 'owner');
      if (!ownerRole) throw new Error('Owner role not created');

      // Create owner member
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: createDto.ownerId,
          roleId: ownerRole.id,
          email: createDto.ownerEmail,
          name: createDto.ownerName,
          isActive: true,
        },
      });

      // Create default free subscription
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          planId: 'free',
          planName: 'Free Plan',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          amount: 0,
          currency: createDto.currency || 'USD',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          maxUsers: 3,
          maxStorage: 1024,
          usedUsers: 1,
        },
      });

      return org;
    });

    // Emit Kafka event
    this.kafkaClient.emit('organization.created', {
      organizationId: organization.id,
      slug: organization.slug,
      ownerId: createDto.ownerId,
    });

    return this.findOne(organization.id);
  }

  async findAll(query: QueryOrganizationDto) {
    const where: any = {};

    if (query.userId) {
      where.members = {
        some: {
          userId: query.userId,
          isActive: true,
        },
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const organizations = await this.prisma.organization.findMany({
      where,
      include: {
        members: {
          where: query.userId ? { userId: query.userId } : undefined,
          include: { role: true },
        },
        subscription: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return organizations;
  }

  async findByUser(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
            isActive: true,
          },
        },
        isActive: true,
      },
      include: {
        members: {
          where: { userId },
          include: { role: true },
        },
        subscription: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: { role: true },
          where: { isActive: true },
        },
        roles: true,
        subscription: true,
        _count: {
          select: { members: true, invites: { where: { status: 'PENDING' } } },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        subscription: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with slug ${slug} not found`);
    }

    return organization;
  }

  async update(id: string, updateDto: UpdateOrganizationDto, userId: string) {
    // Verify permission
    await this.requirePermission(id, userId, 'org:manage');

    // Check slug uniqueness if being changed
    if (updateDto.slug) {
      const existing = await this.prisma.organization.findFirst({
        where: { slug: updateDto.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Organization slug already exists');
      }
    }

    const { ownerId, ownerEmail, ownerName, ...updateData } = updateDto;

    await this.prisma.organization.update({
      where: { id },
      data: updateData,
    });

    // Emit Kafka event
    this.kafkaClient.emit('organization.updated', {
      organizationId: id,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    // Verify permission (only owner can delete)
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId: id, userId },
      include: { role: true },
    });

    if (!member || member.role.name !== 'owner') {
      throw new ForbiddenException('Only the owner can delete an organization');
    }

    await this.prisma.organization.delete({ where: { id } });

    // Emit Kafka event
    this.kafkaClient.emit('organization.deleted', {
      organizationId: id,
      deletedBy: userId,
    });

    return { success: true };
  }

  async validateAccess(organizationId: string, userId: string, permission?: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId, isActive: true },
      include: { role: true },
    });

    if (!member) {
      return { hasAccess: false, member: null };
    }

    if (permission) {
      const permissions = member.role.permissions as string[];
      if (!permissions.includes(permission)) {
        return { hasAccess: false, member, missingPermission: permission };
      }
    }

    return { hasAccess: true, member };
  }

  async handleUserDeleted(userId: string) {
    // Remove user from all organizations
    await this.prisma.organizationMember.deleteMany({
      where: { userId },
    });

    // Cancel any pending invites
    await this.prisma.organizationInvite.updateMany({
      where: { invitedBy: userId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
  }

  private async requirePermission(organizationId: string, userId: string, permission: string) {
    const result = await this.validateAccess(organizationId, userId, permission);
    if (!result.hasAccess) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
    return result.member;
  }
}
