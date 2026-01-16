import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { ALL_PERMISSIONS } from './constants';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.organizationRole.findMany({
      where: { organizationId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { hierarchyLevel: 'desc' },
    });
  }

  getAllPermissions() {
    return {
      permissions: ALL_PERMISSIONS,
      groups: [
        { name: 'Organization', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('org:')) },
        { name: 'Users', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('users:')) },
        { name: 'Products', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('products:')) },
        { name: 'Sales', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('sales:')) },
        { name: 'Customers', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('customers:')) },
        { name: 'Invoices', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('invoices:')) },
        { name: 'Expenses', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('expenses:')) },
        { name: 'Purchases', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('purchases:')) },
        { name: 'Inventory', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('inventory:')) },
        { name: 'Reports', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('reports:')) },
        { name: 'Settings', permissions: ALL_PERMISSIONS.filter((p) => p.startsWith('settings:')) },
      ],
    };
  }

  async findOne(organizationId: string, id: string) {
    const role = await this.prisma.organizationRole.findFirst({
      where: { id, organizationId },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(organizationId: string, createDto: CreateRoleDto, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:manage');

    // Check name uniqueness
    const existing = await this.prisma.organizationRole.findFirst({
      where: { organizationId, name: createDto.name },
    });
    if (existing) {
      throw new ConflictException('Role name already exists in this organization');
    }

    // Validate permissions
    this.validatePermissions(createDto.permissions);

    return this.prisma.organizationRole.create({
      data: {
        organizationId,
        name: createDto.name,
        displayName: createDto.displayName,
        displayNameAr: createDto.displayNameAr,
        description: createDto.description,
        descriptionAr: createDto.descriptionAr,
        hierarchyLevel: createDto.hierarchyLevel,
        isSystem: false,
        permissions: createDto.permissions,
      },
    });
  }

  async update(organizationId: string, id: string, updateDto: UpdateRoleDto, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:manage');

    const role = await this.findOne(organizationId, id);

    // Cannot modify owner role's name or hierarchy
    if (role.name === 'owner' && (updateDto.name || updateDto.hierarchyLevel)) {
      throw new ForbiddenException('Cannot modify owner role name or hierarchy');
    }

    // Check name uniqueness if changing
    if (updateDto.name && updateDto.name !== role.name) {
      const existing = await this.prisma.organizationRole.findFirst({
        where: { organizationId, name: updateDto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Validate permissions if provided
    if (updateDto.permissions) {
      this.validatePermissions(updateDto.permissions);
    }

    return this.prisma.organizationRole.update({
      where: { id },
      data: updateDto,
    });
  }

  async updatePermissions(organizationId: string, id: string, permissions: string[], userId: string) {
    await this.requirePermission(organizationId, userId, 'org:manage');

    const role = await this.findOne(organizationId, id);

    // Cannot modify owner role permissions
    if (role.name === 'owner') {
      throw new ForbiddenException('Cannot modify owner role permissions');
    }

    // Owner-only permissions cannot be assigned to other roles
    const ownerOnlyPermissions = ['org:manage', 'org:billing'];
    const invalidPermissions = permissions.filter((p) => ownerOnlyPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      throw new BadRequestException(`Permissions ${invalidPermissions.join(', ')} can only be assigned to owner role`);
    }

    this.validatePermissions(permissions);

    return this.prisma.organizationRole.update({
      where: { id },
      data: { permissions },
    });
  }

  async bulkUpdatePermissions(
    organizationId: string,
    updates: Array<{ roleId: string; permissions: string[] }>,
    userId: string
  ) {
    await this.requirePermission(organizationId, userId, 'org:manage');

    const ownerOnlyPermissions = ['org:manage', 'org:billing'];

    const results = await Promise.all(
      updates.map(async ({ roleId, permissions }) => {
        const role = await this.findOne(organizationId, roleId);

        // Skip owner role
        if (role.name === 'owner') {
          return { roleId, skipped: true, reason: 'Owner role cannot be modified' };
        }

        // Filter out owner-only permissions
        const filteredPermissions = permissions.filter((p) => !ownerOnlyPermissions.includes(p));
        this.validatePermissions(filteredPermissions);

        await this.prisma.organizationRole.update({
          where: { id: roleId },
          data: { permissions: filteredPermissions },
        });

        return { roleId, updated: true };
      })
    );

    return results;
  }

  async remove(organizationId: string, id: string, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:manage');

    const role = await this.findOne(organizationId, id);

    // Cannot delete system roles
    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system roles');
    }

    // Cannot delete if members are assigned
    if (role._count.members > 0) {
      throw new ConflictException('Cannot delete role with assigned members. Reassign members first.');
    }

    await this.prisma.organizationRole.delete({ where: { id } });

    return { success: true };
  }

  private validatePermissions(permissions: string[]) {
    const invalidPermissions = permissions.filter((p) => !ALL_PERMISSIONS.includes(p as any));
    if (invalidPermissions.length > 0) {
      throw new BadRequestException(`Invalid permissions: ${invalidPermissions.join(', ')}`);
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
