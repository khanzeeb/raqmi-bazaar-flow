import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiGateway } from '@/lib/api/gateway';
import { config } from '@/lib/config';
import { useAuth } from '@/features/auth';
import {
  Organization,
  OrganizationMember,
  OrganizationContextValue,
  Permission,
  AppRole,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
} from '../types';

const STORAGE_KEY = 'current_organization_id';

// Mock data for development - replace with API calls
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Raqmi Technologies',
    slug: 'raqmi-tech',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    industry: 'Technology',
    settings: {
      defaultTaxRate: 15,
      invoicePrefix: 'INV',
      quotationPrefix: 'QT',
      expensePrefix: 'EXP',
      purchasePrefix: 'PO',
      fiscalYearStart: 1,
      language: 'en',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-2',
    name: 'Al-Mamlaka Trading',
    slug: 'al-mamlaka',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    industry: 'Retail',
    settings: {
      defaultTaxRate: 15,
      invoicePrefix: 'INV',
      quotationPrefix: 'QT',
      expensePrefix: 'EXP',
      purchasePrefix: 'PO',
      fiscalYearStart: 1,
      language: 'ar',
    },
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'org-3',
    name: 'Gulf Supplies Co.',
    slug: 'gulf-supplies',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    industry: 'Wholesale',
    settings: {
      defaultTaxRate: 15,
      invoicePrefix: 'GS-INV',
      quotationPrefix: 'GS-QT',
      expensePrefix: 'GS-EXP',
      purchasePrefix: 'GS-PO',
      fiscalYearStart: 4,
      language: 'en',
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
];

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentMembership, setCurrentMembership] = useState<OrganizationMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock memberships based on authenticated user
  const getMockMembership = useCallback((orgId: string): OrganizationMember | null => {
    if (!user) return null;
    
    const roleMap: Record<string, AppRole> = {
      'org-1': 'owner',
      'org-2': 'admin',
      'org-3': 'member',
    };

    return {
      id: `mem-${orgId}`,
      userId: user.id,
      organizationId: orgId,
      role: roleMap[orgId] || 'member',
      email: user.email,
      name: user.name,
      isActive: true,
      joinedAt: '2024-01-01T00:00:00Z',
    };
  }, [user]);

  // Load organizations when user is authenticated
  useEffect(() => {
    const loadOrganizations = async () => {
      // Don't load if not authenticated
      if (!isAuthenticated || !user) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setCurrentMembership(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        if (config.useMockData) {
          // Use mock data
          await new Promise(resolve => setTimeout(resolve, 300));
          setOrganizations(MOCK_ORGANIZATIONS);
          
          // Restore last selected organization
          const savedOrgId = localStorage.getItem(STORAGE_KEY);
          const defaultOrg = savedOrgId 
            ? MOCK_ORGANIZATIONS.find(o => o.id === savedOrgId) || MOCK_ORGANIZATIONS[0]
            : MOCK_ORGANIZATIONS[0];
          
          if (defaultOrg) {
            setCurrentOrganization(defaultOrg);
            setCurrentMembership(getMockMembership(defaultOrg.id));
          }
        } else {
          // Fetch from organization-service
          const response = await apiGateway.get<{ organizations: Organization[] }>(
            '/organizations/my',
            undefined,
            { skipOrgHeader: true }
          );
          
          if (response.success && response.data) {
            setOrganizations(response.data.organizations);
            
            const savedOrgId = localStorage.getItem(STORAGE_KEY);
            const defaultOrg = savedOrgId 
              ? response.data.organizations.find(o => o.id === savedOrgId) || response.data.organizations[0]
              : response.data.organizations[0];
            
            if (defaultOrg) {
              setCurrentOrganization(defaultOrg);
              // Fetch membership for this org
              const memberResponse = await apiGateway.get<OrganizationMember>(
                `/organizations/${defaultOrg.id}/membership`
              );
              if (memberResponse.success && memberResponse.data) {
                setCurrentMembership(memberResponse.data);
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrganizations();
  }, [isAuthenticated, user, getMockMembership]);

  const switchOrganization = useCallback(async (orgId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const org = organizations.find(o => o.id === orgId);
      if (!org) {
        throw new Error('Organization not found');
      }
      
      if (config.useMockData) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const membership = getMockMembership(orgId);
        if (!membership) {
          throw new Error('You do not have access to this organization');
        }
        
        setCurrentOrganization(org);
        setCurrentMembership(membership);
      } else {
        // Fetch membership from API
        const memberResponse = await apiGateway.get<OrganizationMember>(
          `/organizations/${orgId}/membership`
        );
        
        if (!memberResponse.success || !memberResponse.data) {
          throw new Error('You do not have access to this organization');
        }
        
        setCurrentOrganization(org);
        setCurrentMembership(memberResponse.data);
      }
      
      localStorage.setItem(STORAGE_KEY, orgId);
      
      // Trigger a custom event for other parts of the app to react
      window.dispatchEvent(new CustomEvent('organization-changed', { detail: { organization: org } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organizations, getMockMembership]);

  const refreshOrganizations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (config.useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setOrganizations(MOCK_ORGANIZATIONS);
      } else {
        const response = await apiGateway.get<{ organizations: Organization[] }>(
          '/organizations/my',
          undefined,
          { skipOrgHeader: true }
        );
        
        if (response.success && response.data) {
          setOrganizations(response.data.organizations);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh organizations');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentMembership) return false;
    return ROLE_PERMISSIONS[currentMembership.role]?.includes(permission) ?? false;
  }, [currentMembership]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);

  const hasRole = useCallback((role: AppRole): boolean => {
    if (!currentMembership) return false;
    return currentMembership.role === role;
  }, [currentMembership]);

  const hasMinRole = useCallback((minRole: AppRole): boolean => {
    if (!currentMembership) return false;
    return ROLE_HIERARCHY[currentMembership.role] >= ROLE_HIERARCHY[minRole];
  }, [currentMembership]);

  const value: OrganizationContextValue = {
    currentOrganization,
    currentMembership,
    organizations,
    isLoading,
    error,
    switchOrganization,
    refreshOrganizations,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasMinRole,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
