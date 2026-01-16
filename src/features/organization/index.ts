// Organization feature exports

// Types
export * from './types';

// Context
export { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';

// Hooks
export {
  usePermissions,
  useHasRole,
  useHasMinRole,
  useCan,
  useCanAny,
  usePermissionCheck,
  useRoleInfo,
} from './hooks/usePermissions';

// Components
export { OrganizationSwitcher } from './components/OrganizationSwitcher';
export { PermissionGate, withPermission, useCanAccess } from './components/PermissionGate';

// Settings Components
export * from './components/settings';
