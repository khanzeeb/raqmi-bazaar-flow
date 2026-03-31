import { ApiResponse } from '@/types/api';
import { Supplier, SupplierFilters, SupplierStats, CreateSupplierDTO, UpdateSupplierDTO } from '../types';

const API_BASE_URL = import.meta.env.VITE_SUPPLIER_SERVICE_URL || 'http://localhost:3013';

interface SuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BackendSupplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  status: 'active' | 'inactive';
  credit_limit: number;
  notes?: string;
  total_purchases?: number;
  total_spent?: number;
  last_purchase_date?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

const transformBackendSupplier = (s: BackendSupplier): Supplier => ({
  id: s.id,
  name: s.name,
  contactPerson: s.contact_person || '',
  email: s.email || '',
  phone: s.phone || '',
  status: s.status,
  creditLimit: Number(s.credit_limit) || 0,
  address: {
    street: s.address || '',
    city: s.city || '',
    state: s.state || '',
    postalCode: s.postal_code || '',
    country: s.country || 'Saudi Arabia',
  },
  taxId: s.tax_id,
  notes: s.notes,
  totalPurchases: s.total_purchases || 0,
  totalSpent: s.total_spent || 0,
  lastPurchaseDate: s.last_purchase_date,
  rating: s.rating,
  dateAdded: s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
});

const transformToBackend = (data: CreateSupplierDTO | Partial<UpdateSupplierDTO>) => ({
  name: data.name,
  contact_person: data.contactPerson,
  email: data.email,
  phone: data.phone,
  address: data.address?.street,
  city: data.address?.city,
  state: data.address?.state,
  postal_code: data.address?.postalCode,
  country: data.address?.country,
  tax_id: data.taxId,
  credit_limit: data.creditLimit,
  notes: data.notes,
});

export interface ISupplierGateway {
  getAll(filters?: Partial<SupplierFilters> & { page?: number; limit?: number }): Promise<ApiResponse<SuppliersResponse>>;
  getById(id: string): Promise<ApiResponse<Supplier>>;
  create(data: CreateSupplierDTO): Promise<ApiResponse<Supplier>>;
  update(id: string, data: Partial<UpdateSupplierDTO>): Promise<ApiResponse<Supplier>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<SupplierStats>>;
}

export const supplierGateway: ISupplierGateway = {
  async getAll(filters?) {
    try {
      const params = new URLSearchParams();
      if (filters?.searchQuery) params.set('search', filters.searchQuery);
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters?.country && filters.country !== 'all') params.set('country', filters.country);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/suppliers?${params.toString()}`);
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } };
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const suppliers = Array.isArray(rawData) ? rawData.map(transformBackendSupplier) : [];
        return {
          success: true,
          data: {
            data: suppliers,
            total: result.data?.total || suppliers.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1,
          },
        };
      }
      return { success: false, error: result.error || 'Failed to fetch suppliers' };
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch suppliers' };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendSupplier(result.data) };
      }
      return { success: false, error: result.error || 'Supplier not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch supplier' };
    }
  },

  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data)),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendSupplier(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create supplier' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create supplier' };
    }
  },

  async update(id, data) {
    try {
      const payload = { ...transformToBackend(data), status: data.status };
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendSupplier(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update supplier' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update supplier' };
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP error! status: ${response.status}`);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete supplier' };
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers?limit=1000`);
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { totalSuppliers: 0, activeSuppliers: 0, inactiveSuppliers: 0, totalCreditLimit: 0, totalSpent: 0 } };
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const suppliers = Array.isArray(rawData) ? rawData.map(transformBackendSupplier) : [];
        return {
          success: true,
          data: {
            totalSuppliers: suppliers.length,
            activeSuppliers: suppliers.filter(s => s.status === 'active').length,
            inactiveSuppliers: suppliers.filter(s => s.status === 'inactive').length,
            totalCreditLimit: suppliers.reduce((sum, s) => sum + s.creditLimit, 0),
            totalSpent: suppliers.reduce((sum, s) => sum + s.totalSpent, 0),
          },
        };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },
};
