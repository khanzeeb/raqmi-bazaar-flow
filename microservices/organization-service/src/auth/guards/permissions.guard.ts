import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY, RolesRequirement } from '../decorators/roles.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check for required roles
    const rolesRequirement = this.reflector.getAllAndOverride<RolesRequirement>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions or roles required, allow access
    if (!requiredPermissions?.length && !rolesRequirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const organizationId = request.params.orgId || request.headers['x-organization-id'];

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Get user's membership and role
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId, isActive: true },
      include: { role: true },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this organization');
    }

    // Attach member to request for use in controllers
    request.member = member;

    const userPermissions = member.role.permissions as string[];
    const userRole = member.role.name;
    const userHierarchy = member.role.hierarchyLevel;

    // Check role requirements
    if (rolesRequirement) {
      const { roles, minLevel, requireAny } = rolesRequirement;

      if (roles?.length) {
        const hasRole = requireAny
          ? roles.some((r) => r === userRole)
          : roles.every((r) => r === userRole);

        if (!hasRole) {
          throw new ForbiddenException(`Required role: ${roles.join(' or ')}`);
        }
      }

      if (minLevel !== undefined && userHierarchy < minLevel) {
        throw new ForbiddenException('Insufficient role level');
      }
    }

    // Check permission requirements
    if (requiredPermissions?.length) {
      const hasAllPermissions = requiredPermissions.every((p) => userPermissions.includes(p));

      if (!hasAllPermissions) {
        const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));
        throw new ForbiddenException(`Missing permissions: ${missing.join(', ')}`);
      }
    }

    return true;
  }
}
