// Pricing Gateway - API integration for pricing rules operations
import { ApiResponse } from '@/types/api';
import { PricingRule } from '@/types/pricing.types';

const API_BASE_URL = import.meta.env.VITE_PRICING_SERVICE_URL || 'http://localhost:3009';

interface PricingRulesResponse {
  data: PricingRule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PricingStats {
  activeRules: number;
  inactiveRules: number;
  totalUsage: number;
  promoCodes: number;
  averageDiscount: number;
}

interface BackendPricingRule {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  min_quantity?: number;
  max_quantity?: number;
  customer_type?: string;
  product_categories?: string[];
  start_date?: string;
  end_date?: string;
  promo_code?: string;
  discount_type: string;
  discount_value: number;
  max_discount?: number;
  priority: number;
  usage_count: number;
  max_usage?: number;
  created_at: string;
  updated_at?: string;
}

const transformBackendRule = (rule: BackendPricingRule): PricingRule => ({
  id: rule.id,
  name: rule.name,
  type: mapType(rule.type),
  status: mapStatus(rule.status),
  description: rule.description || '',
  conditions: {
    minQuantity: rule.min_quantity,
    maxQuantity: rule.max_quantity,
    customerType: mapCustomerType(rule.customer_type),
    productCategories: rule.product_categories,
    startDate: rule.start_date?.split('T')[0],
    endDate: rule.end_date?.split('T')[0],
    promoCode: rule.promo_code
  },
  discount: {
    type: rule.discount_type === 'percentage' ? 'percentage' : 'fixed_amount',
    value: rule.discount_value,
    maxDiscount: rule.max_discount
  },
  priority: rule.priority,
  usageCount: rule.usage_count,
  maxUsage: rule.max_usage,
  createdAt: rule.created_at?.split('T')[0] || ''
});

const mapType = (type: string): PricingRule['type'] => {
  const typeMap: Record<string, PricingRule['type']> = {
    'tiered': 'tiered',
    'time_based': 'time_based',
    'bundle': 'bundle',
    'customer_specific': 'customer_specific',
    'promo_code': 'promo_code'
  };
  return typeMap[type] || 'tiered';
};

const mapStatus = (status: string): PricingRule['status'] => {
  const statusMap: Record<string, PricingRule['status']> = {
    'active': 'active',
    'inactive': 'inactive',
    'scheduled': 'scheduled'
  };
  return statusMap[status] || 'inactive';
};

const mapCustomerType = (type?: string): 'individual' | 'business' | 'vip' | undefined => {
  if (!type) return undefined;
  const typeMap: Record<string, 'individual' | 'business' | 'vip'> = {
    'individual': 'individual',
    'business': 'business',
    'vip': 'vip'
  };
  return typeMap[type];
};

const transformToBackend = (data: Partial<PricingRule>) => ({
  name: data.name,
  type: data.type,
  status: data.status,
  description: data.description,
  min_quantity: data.conditions?.minQuantity,
  max_quantity: data.conditions?.maxQuantity,
  customer_type: data.conditions?.customerType,
  product_categories: data.conditions?.productCategories,
  start_date: data.conditions?.startDate,
  end_date: data.conditions?.endDate,
  promo_code: data.conditions?.promoCode,
  discount_type: data.discount?.type,
  discount_value: data.discount?.value,
  max_discount: data.discount?.maxDiscount,
  priority: data.priority,
  max_usage: data.maxUsage
});

export interface IPricingGateway {
  getAll(filters?: { search?: string; type?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<PricingRulesResponse>>;
  getById(id: string): Promise<ApiResponse<PricingRule>>;
  create(data: Omit<PricingRule, 'id' | 'createdAt' | 'usageCount'>): Promise<ApiResponse<PricingRule>>;
  update(id: string, data: Partial<PricingRule>): Promise<ApiResponse<PricingRule>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<PricingStats>>;
  toggleStatus(id: string): Promise<ApiResponse<PricingRule>>;
  validatePromoCode(code: string, context?: { customerId?: string; productIds?: string[]; quantity?: number }): Promise<ApiResponse<PricingRule | null>>;
}

export const pricingGateway: IPricingGateway = {
  async getAll(filters?): Promise<ApiResponse<PricingRulesResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.type) params.set('type', filters.type);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/pricing?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } };
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const rules = Array.isArray(rawData) ? rawData.map(transformBackendRule) : [];
        return { 
          success: true, 
          data: {
            data: rules,
            total: result.data?.total || rules.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch pricing rules' };
    } catch (error) {
      console.error('Failed to fetch pricing rules:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch pricing rules' };
    }
  },

  async getById(id: string): Promise<ApiResponse<PricingRule>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendRule(result.data) };
      }
      return { success: false, error: result.error || 'Pricing rule not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch pricing rule' };
    }
  },

  async create(data): Promise<ApiResponse<PricingRule>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendRule(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create pricing rule' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create pricing rule' };
    }
  },

  async update(id: string, data): Promise<ApiResponse<PricingRule>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendRule(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update pricing rule' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update pricing rule' };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete pricing rule' };
    }
  },

  async getStats(): Promise<ApiResponse<PricingStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/stats`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const rules = listResponse.data.data;
          const totalUsage = rules.reduce((sum, r) => sum + r.usageCount, 0);
          const avgDiscount = rules.length > 0 ? rules.reduce((sum, r) => sum + r.discount.value, 0) / rules.length : 0;
          return {
            success: true,
            data: {
              activeRules: rules.filter(r => r.status === 'active').length,
              inactiveRules: rules.filter(r => r.status === 'inactive').length,
              totalUsage,
              promoCodes: rules.filter(r => r.type === 'promo_code').length,
              averageDiscount: avgDiscount
            }
          };
        }
        return { success: true, data: { activeRules: 0, inactiveRules: 0, totalUsage: 0, promoCodes: 0, averageDiscount: 0 } };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { 
          success: true, 
          data: {
            activeRules: result.data.active_rules || result.data.activeRules || 0,
            inactiveRules: result.data.inactive_rules || result.data.inactiveRules || 0,
            totalUsage: result.data.total_usage || result.data.totalUsage || 0,
            promoCodes: result.data.promo_codes || result.data.promoCodes || 0,
            averageDiscount: result.data.average_discount || result.data.averageDiscount || 0
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },

  async toggleStatus(id: string): Promise<ApiResponse<PricingRule>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendRule(result.data) };
      }
      return { success: false, error: result.error || 'Failed to toggle status' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle status' };
    }
  },

  async validatePromoCode(code, context): Promise<ApiResponse<PricingRule | null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...context })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, data: null };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendRule(result.data) };
      }
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to validate promo code' };
    }
  }
};
