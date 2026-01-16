import { useMemo } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { Permission, AppRole, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../types';

/**
 * Hook for checking user permissions in the current organization
 */
export function usePermissions() {
  const { currentMembership, hasPermission, hasAnyPermission, hasAllPermissions } = useOrganization();
  
  const permissions = useMemo(() => {
    if (!currentMembership) return [];
    return ROLE_PERMISSIONS[currentMembership.role] || [];
  }, [currentMembership]);
  
  return {
    permissions,
    role: currentMembership?.role ?? null,
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions,
  };
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: AppRole): boolean {
  const { currentMembership } = useOrganization();
  return currentMembership?.role === role;
}

/**
 * Hook to check if user meets minimum role requirement
 */
export function useHasMinRole(minRole: AppRole): boolean {
  const { currentMembership } = useOrganization();
  if (!currentMembership) return false;
  return ROLE_HIERARCHY[currentMembership.role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Hook to check if user can perform a specific action
 */
export function useCan(permission: Permission): boolean {
  const { hasPermission } = useOrganization();
  return hasPermission(permission);
}

/**
 * Hook to check if user can perform any of the specified actions
 */
export function useCanAny(permissions: Permission[]): boolean {
  const { hasAnyPermission } = useOrganization();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissionCheck(permissions: Permission[]): Record<Permission, boolean> {
  const { hasPermission } = useOrganization();
  
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const permission of permissions) {
      result[permission] = hasPermission(permission);
    }
    return result as Record<Permission, boolean>;
  }, [permissions, hasPermission]);
}

/**
 * Get role display info
 */
export function useRoleInfo() {
  const { currentMembership } = useOrganization();
  
  const roleLabels: Record<AppRole, { en: string; ar: string }> = {
    owner: { en: 'Owner', ar: 'المالك' },
    admin: { en: 'Administrator', ar: 'مدير' },
    manager: { en: 'Manager', ar: 'مشرف' },
    member: { en: 'Member', ar: 'عضو' },
    viewer: { en: 'Viewer', ar: 'مشاهد' },
  };
  
  const roleColors: Record<AppRole, string> = {
    owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    manager: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    member: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    viewer: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  
  if (!currentMembership) {
    return { label: null, color: null, role: null };
  }
  
  return {
    label: roleLabels[currentMembership.role],
    color: roleColors[currentMembership.role],
    role: currentMembership.role,
  };
}
