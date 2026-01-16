import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export interface RolesRequirement {
  roles?: string[];
  minLevel?: number;
  requireAny?: boolean;
}

/**
 * Requires the user to have one of the specified roles
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, { roles, requireAny: true } as RolesRequirement);

/**
 * Requires the user to have a minimum role hierarchy level
 * owner=100, admin=80, manager=60, member=40, viewer=20
 */
export const RequireMinRoleLevel = (minLevel: number) =>
  SetMetadata(ROLES_KEY, { minLevel } as RolesRequirement);

/**
 * Requires owner role specifically
 */
export const RequireOwner = () => RequireRoles('owner');

/**
 * Requires admin or owner role
 */
export const RequireAdmin = () => RequireMinRoleLevel(80);

/**
 * Requires manager, admin, or owner role
 */
export const RequireManager = () => RequireMinRoleLevel(60);
