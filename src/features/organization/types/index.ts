// Organization & Role-Based Access Control Types

export type AppRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export type Permission = 
  | 'org:manage'
  | 'org:billing'
  | 'users:manage'
  | 'users:invite'
  | 'users:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'products:view'
  | 'sales:create'
  | 'sales:edit'
  | 'sales:delete'
  | 'sales:view'
  | 'customers:create'
  | 'customers:edit'
  | 'customers:delete'
  | 'customers:view'
  | 'invoices:create'
  | 'invoices:edit'
  | 'invoices:delete'
  | 'invoices:view'
  | 'expenses:create'
  | 'expenses:edit'
  | 'expenses:delete'
  | 'expenses:view'
  | 'expenses:approve'
  | 'purchases:create'
  | 'purchases:edit'
  | 'purchases:delete'
  | 'purchases:view'
  | 'inventory:manage'
  | 'inventory:view'
  | 'reports:view'
  | 'reports:export'
  | 'settings:manage'
  | 'settings:view';

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  owner: [
    'org:manage', 'org:billing',
    'users:manage', 'users:invite', 'users:view',
    'products:create', 'products:edit', 'products:delete', 'products:view',
    'sales:create', 'sales:edit', 'sales:delete', 'sales:view',
    'customers:create', 'customers:edit', 'customers:delete', 'customers:view',
    'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:view',
    'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:view', 'expenses:approve',
    'purchases:create', 'purchases:edit', 'purchases:delete', 'purchases:view',
    'inventory:manage', 'inventory:view',
    'reports:view', 'reports:export',
    'settings:manage', 'settings:view',
  ],
  admin: [
    'users:manage', 'users:invite', 'users:view',
    'products:create', 'products:edit', 'products:delete', 'products:view',
    'sales:create', 'sales:edit', 'sales:delete', 'sales:view',
    'customers:create', 'customers:edit', 'customers:delete', 'customers:view',
    'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:view',
    'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:view', 'expenses:approve',
    'purchases:create', 'purchases:edit', 'purchases:delete', 'purchases:view',
    'inventory:manage', 'inventory:view',
    'reports:view', 'reports:export',
    'settings:manage', 'settings:view',
  ],
  manager: [
    'users:invite', 'users:view',
    'products:create', 'products:edit', 'products:view',
    'sales:create', 'sales:edit', 'sales:view',
    'customers:create', 'customers:edit', 'customers:view',
    'invoices:create', 'invoices:edit', 'invoices:view',
    'expenses:create', 'expenses:edit', 'expenses:view',
    'purchases:create', 'purchases:edit', 'purchases:view',
    'inventory:manage', 'inventory:view',
    'reports:view',
    'settings:view',
  ],
  member: [
    'users:view',
    'products:create', 'products:edit', 'products:view',
    'sales:create', 'sales:edit', 'sales:view',
    'customers:create', 'customers:edit', 'customers:view',
    'invoices:create', 'invoices:view',
    'expenses:create', 'expenses:view',
    'purchases:view',
    'inventory:view',
    'reports:view',
  ],
  viewer: [
    'products:view',
    'sales:view',
    'customers:view',
    'invoices:view',
    'expenses:view',
    'purchases:view',
    'inventory:view',
    'reports:view',
  ],
};

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  industry?: string;
  taxNumber?: string;
  currency: string;
  timezone: string;
  address?: OrganizationAddress;
  settings?: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface OrganizationSettings {
  defaultTaxRate: number;
  invoicePrefix: string;
  quotationPrefix: string;
  expensePrefix: string;
  purchasePrefix: string;
  fiscalYearStart: number; // Month (1-12)
  language: 'en' | 'ar';
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: AppRole;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  invitedBy?: string;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: AppRole;
  invitedBy: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface OrganizationContextValue {
  // Current state
  currentOrganization: Organization | null;
  currentMembership: OrganizationMember | null;
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  
  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: AppRole) => boolean;
  hasMinRole: (minRole: AppRole) => boolean;
}

export interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Role hierarchy for comparison
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  owner: 100,
  admin: 80,
  manager: 60,
  member: 40,
  viewer: 20,
};

// Helper to check if role meets minimum level
export function meetsMinRole(userRole: AppRole, minRole: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

// Helper to check permission
export function roleHasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
