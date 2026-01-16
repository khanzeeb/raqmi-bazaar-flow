import React, { ReactNode } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { Permission, AppRole } from '../types';

interface PermissionGateProps {
  children: ReactNode;
  /** Single permission required */
  permission?: Permission;
  /** Any of these permissions required */
  anyPermission?: Permission[];
  /** All of these permissions required */
  allPermissions?: Permission[];
  /** Exact role required */
  role?: AppRole;
  /** Minimum role level required */
  minRole?: AppRole;
  /** What to show when access is denied */
  fallback?: ReactNode;
  /** Whether to show nothing (null) or the fallback */
  showFallback?: boolean;
}

/**
 * Component to conditionally render children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="products:create">
 *   <CreateProductButton />
 * </PermissionGate>
 * 
 * @example
 * // Any of multiple permissions
 * <PermissionGate anyPermission={['products:edit', 'products:delete']}>
 *   <ProductActions />
 * </PermissionGate>
 * 
 * @example
 * // Minimum role
 * <PermissionGate minRole="manager">
 *   <ManagerDashboard />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate permission="reports:export" fallback={<UpgradePrompt />}>
 *   <ExportButton />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  minRole,
  fallback = null,
  showFallback = true,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasMinRole } = useOrganization();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (anyPermission?.length) {
    hasAccess = hasAccess && hasAnyPermission(anyPermission);
  }

  if (allPermissions?.length) {
    hasAccess = hasAccess && hasAllPermissions(allPermissions);
  }

  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  if (minRole) {
    hasAccess = hasAccess && hasMinRole(minRole);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
}

/**
 * Higher-order component version of PermissionGate
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<PermissionGateProps, 'children'>
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGate {...options}>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Hook-based permission check that returns a boolean
 * Useful for conditional logic outside of JSX
 */
export function useCanAccess(options: Omit<PermissionGateProps, 'children' | 'fallback' | 'showFallback'>): boolean {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasMinRole } = useOrganization();

  let hasAccess = true;

  if (options.permission) {
    hasAccess = hasAccess && hasPermission(options.permission);
  }

  if (options.anyPermission?.length) {
    hasAccess = hasAccess && hasAnyPermission(options.anyPermission);
  }

  if (options.allPermissions?.length) {
    hasAccess = hasAccess && hasAllPermissions(options.allPermissions);
  }

  if (options.role) {
    hasAccess = hasAccess && hasRole(options.role);
  }

  if (options.minRole) {
    hasAccess = hasAccess && hasMinRole(options.minRole);
  }

  return hasAccess;
}
