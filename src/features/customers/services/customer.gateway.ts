// Customer Gateway - API integration for customer operations
import { ApiResponse } from '@/types/api';
import { Customer, CustomerFilters, CustomerStats, CreateCustomerDTO, UpdateCustomerDTO } from '../types';

const API_BASE_URL = import.meta.env.VITE_CUSTOMER_SERVICE_URL || 'http://localhost:3003';

interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreditHistoryEntry {
  id: string;
  customerId: string;
  amount: number;
  type: 'add' | 'subtract';
  previousBalance: number;
  newBalance: number;
  reason?: string;
  createdAt: string;
}

interface BackendCustomer {
  id: string;
  name: string;
  name_ar?: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  tax_number?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'blocked';
  credit_limit: number;
  used_credit: number;
  available_credit: number;
  overdue_amount: number;
  total_outstanding: number;
  credit_status: 'good' | 'warning' | 'blocked';
  payment_terms: string;
  preferred_language: string;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
  // Stats from joined data
  total_orders?: number;
  lifetime_value?: number;
  last_order_date?: string;
}

// Transform backend customer to frontend Customer type
const transformBackendCustomer = (customer: BackendCustomer): Customer => ({
  id: customer.id,
  name: customer.name,
  nameAr: customer.name_ar || customer.name,
  email: customer.email,
  phone: customer.phone || '',
  customerType: customer.type,
  status: customer.status === 'blocked' ? 'inactive' : customer.status,
  balance: customer.available_credit - customer.overdue_amount,
  lifetimeValue: customer.lifetime_value || 0,
  totalOrders: customer.total_orders || 0,
  lastOrderDate: customer.last_order_date,
  billingAddress: parseAddress(customer.address),
  taxId: customer.tax_number,
  notes: undefined,
  tags: [],
  dateAdded: customer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
});

// Parse address string to structured address object
const parseAddress = (address?: string): Customer['billingAddress'] => {
  if (!address) {
    return {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Saudi Arabia'
    };
  }
  // Try to parse if it's JSON, otherwise use as street
  try {
    const parsed = JSON.parse(address);
    return {
      street: parsed.street || '',
      city: parsed.city || '',
      state: parsed.state || '',
      zipCode: parsed.zipCode || parsed.zip_code || '',
      country: parsed.country || 'Saudi Arabia'
    };
  } catch {
    return {
      street: address,
      city: '',
      state: '',
      zipCode: '',
      country: 'Saudi Arabia'
    };
  }
};

// Transform frontend customer to backend format
const transformToBackend = (data: CreateCustomerDTO | Partial<UpdateCustomerDTO>) => ({
  name: data.name,
  name_ar: data.nameAr,
  email: data.email,
  phone: data.phone,
  type: data.customerType,
  tax_number: data.taxId,
  address: data.billingAddress ? JSON.stringify(data.billingAddress) : undefined,
  company: data.customerType === 'business' ? data.name : undefined
});

export interface ICustomerGateway {
  getAll(filters?: Partial<CustomerFilters> & { page?: number; limit?: number }): Promise<ApiResponse<CustomersResponse>>;
  getById(id: string): Promise<ApiResponse<Customer>>;
  create(data: CreateCustomerDTO): Promise<ApiResponse<Customer>>;
  update(id: string, data: Partial<UpdateCustomerDTO>): Promise<ApiResponse<Customer>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<CustomerStats>>;
  updateCredit(id: string, amount: number, type: 'add' | 'subtract', reason?: string): Promise<ApiResponse<Customer>>;
  getCreditHistory(id: string): Promise<ApiResponse<CreditHistoryEntry[]>>;
  block(id: string, reason?: string): Promise<ApiResponse<Customer>>;
  unblock(id: string, reason?: string): Promise<ApiResponse<Customer>>;
}

export const customerGateway: ICustomerGateway = {
  async getAll(filters?: Partial<CustomerFilters> & { page?: number; limit?: number }): Promise<ApiResponse<CustomersResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.searchQuery) params.set('search', filters.searchQuery);
      if (filters?.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        params.set('type', filters.type);
      }
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/customers?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Non-JSON response from customers API, using fallback');
        return { 
          success: true, 
          data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } 
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const customers = Array.isArray(rawData) ? rawData.map(transformBackendCustomer) : [];
        return { 
          success: true, 
          data: {
            data: customers,
            total: result.data?.total || customers.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch customers' };
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch customers' 
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendCustomer(result.data) };
      }
      return { success: false, error: result.error || 'Customer not found' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch customer' 
      };
    }
  },

  async create(data: CreateCustomerDTO): Promise<ApiResponse<Customer>> {
    try {
      const payload = transformToBackend(data);

      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendCustomer(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create customer' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create customer' 
      };
    }
  },

  async update(id: string, data: Partial<UpdateCustomerDTO>): Promise<ApiResponse<Customer>> {
    try {
      const payload = {
        ...transformToBackend(data),
        status: data.status
      };

      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendCustomer(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update customer' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update customer' 
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true, data: undefined };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete customer' 
      };
    }
  },

  async getStats(): Promise<ApiResponse<CustomerStats>> {
    try {
      // Fetch all customers and compute stats client-side if no dedicated endpoint
      const response = await fetch(`${API_BASE_URL}/api/customers?limit=1000`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { 
          success: true, 
          data: { totalCustomers: 0, activeCustomers: 0, businessCustomers: 0, totalCredit: 0, totalDue: 0 } 
        };
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const customers = Array.isArray(rawData) ? rawData.map(transformBackendCustomer) : [];
        
        return { 
          success: true, 
          data: {
            totalCustomers: customers.length,
            activeCustomers: customers.filter(c => c.status === 'active').length,
            businessCustomers: customers.filter(c => c.customerType === 'business').length,
            totalCredit: customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0),
            totalDue: customers.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0)
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stats' 
      };
    }
  },

  async updateCredit(id: string, amount: number, type: 'add' | 'subtract', reason?: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type, reason })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendCustomer(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update credit' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update credit' 
      };
    }
  },

  async getCreditHistory(id: string): Promise<ApiResponse<CreditHistoryEntry[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}/credit-history`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false) {
        return { success: true, data: result.data || [] };
      }
      return { success: false, error: result.error || 'Failed to fetch credit history' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch credit history' 
      };
    }
  },

  async block(id: string, reason?: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendCustomer(result.data) };
      }
      return { success: false, error: result.error || 'Failed to block customer' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to block customer' 
      };
    }
  },

  async unblock(id: string, reason?: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendCustomer(result.data) };
      }
      return { success: false, error: result.error || 'Failed to unblock customer' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to unblock customer' 
      };
    }
  }
};
