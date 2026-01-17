// Purchase Gateway - API integration for purchase operations
import { ApiResponse } from '@/types/api';
import { Purchase, PurchasePaymentHistory, PurchaseStats, CreatePurchaseDTO, UpdatePurchaseDTO } from '@/types/purchase.types';

const API_BASE_URL = import.meta.env.VITE_PURCHASE_SERVICE_URL || 'http://localhost:3005';

interface PurchasesResponse {
  data: Purchase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BackendPurchase {
  id: string;
  purchase_number: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_phone?: string;
  supplier_email?: string;
  purchase_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount?: number;
  currency?: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled' | 'partial' | 'returned';
  payment_status: 'pending' | 'partial' | 'paid' | 'unpaid';
  payment_method?: string;
  notes?: string;
  added_to_inventory?: boolean;
  items?: BackendPurchaseItem[];
  payment_history?: BackendPaymentHistory[];
  created_at: string;
  updated_at: string;
}

interface BackendPurchaseItem {
  id: string;
  purchase_id?: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  line_total: number;
  received_quantity?: number;
}

interface BackendPaymentHistory {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
}

// Transform backend purchase to frontend Purchase type
const transformBackendPurchase = (purchase: BackendPurchase): Purchase => ({
  id: purchase.id,
  purchaseNumber: purchase.purchase_number,
  supplier: {
    name: purchase.supplier_name,
    phone: purchase.supplier_phone || '',
    email: purchase.supplier_email
  },
  items: (purchase.items || []).map(item => ({
    id: item.id,
    name: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.line_total
  })),
  subtotal: purchase.subtotal,
  taxAmount: purchase.tax_amount,
  total: purchase.total_amount,
  status: mapBackendStatus(purchase.status),
  paymentMethod: mapPaymentMethod(purchase.payment_method),
  paymentStatus: mapPaymentStatus(purchase.payment_status),
  paidAmount: purchase.paid_amount,
  remainingAmount: purchase.remaining_amount ?? (purchase.total_amount - purchase.paid_amount),
  addedToInventory: purchase.added_to_inventory,
  paymentHistory: (purchase.payment_history || []).map(ph => ({
    id: ph.id,
    amount: ph.amount,
    date: ph.payment_date?.split('T')[0] || '',
    method: mapPaymentHistoryMethod(ph.payment_method),
    reference: ph.reference
  })),
  orderDate: purchase.purchase_date?.split('T')[0] || '',
  expectedDate: purchase.expected_delivery_date?.split('T')[0],
  receivedDate: purchase.received_date?.split('T')[0],
  notes: purchase.notes
});

const mapBackendStatus = (status: string): Purchase['status'] => {
  const statusMap: Record<string, Purchase['status']> = {
    'pending': 'pending',
    'ordered': 'pending',
    'received': 'received',
    'partial': 'partial',
    'cancelled': 'returned',
    'returned': 'returned'
  };
  return statusMap[status] || 'pending';
};

const mapPaymentMethod = (method?: string): Purchase['paymentMethod'] => {
  if (!method) return 'credit';
  const methodMap: Record<string, Purchase['paymentMethod']> = {
    'full': 'full',
    'partial': 'partial',
    'credit': 'credit',
    'cash': 'full',
    'bank_transfer': 'full'
  };
  return methodMap[method] || 'credit';
};

const mapPaymentStatus = (status: string): Purchase['paymentStatus'] => {
  const statusMap: Record<string, Purchase['paymentStatus']> = {
    'paid': 'paid',
    'partial': 'partial',
    'pending': 'unpaid',
    'unpaid': 'unpaid'
  };
  return statusMap[status] || 'unpaid';
};

const mapPaymentHistoryMethod = (method: string): PurchasePaymentHistory['method'] => {
  const methodMap: Record<string, PurchasePaymentHistory['method']> = {
    'cash': 'cash',
    'bank_transfer': 'bank_transfer',
    'check': 'check',
    'cheque': 'check'
  };
  return methodMap[method] || 'bank_transfer';
};

// Transform frontend purchase to backend format
const transformToBackend = (data: CreatePurchaseDTO | Partial<UpdatePurchaseDTO>) => ({
  purchase_number: data.purchaseNumber,
  supplier_name: data.supplier?.name,
  supplier_phone: data.supplier?.phone,
  supplier_email: data.supplier?.email,
  expected_delivery_date: data.expectedDate,
  notes: data.notes,
  items: data.items?.map(item => ({
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.quantity * item.unitPrice
  }))
});

export interface IPurchaseGateway {
  getAll(filters?: { search?: string; status?: string; paymentStatus?: string; page?: number; limit?: number }): Promise<ApiResponse<PurchasesResponse>>;
  getById(id: string): Promise<ApiResponse<Purchase>>;
  create(data: CreatePurchaseDTO): Promise<ApiResponse<Purchase>>;
  update(id: string, data: Partial<UpdatePurchaseDTO>): Promise<ApiResponse<Purchase>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<PurchaseStats>>;
  updateStatus(id: string, status: string): Promise<ApiResponse<Purchase>>;
  markAsReceived(id: string): Promise<ApiResponse<Purchase>>;
  addPayment(id: string, paymentData: Omit<PurchasePaymentHistory, 'id'>): Promise<ApiResponse<Purchase>>;
}

export const purchaseGateway: IPurchaseGateway = {
  async getAll(filters?: { search?: string; status?: string; paymentStatus?: string; page?: number; limit?: number }): Promise<ApiResponse<PurchasesResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.paymentStatus) params.set('payment_status', filters.paymentStatus);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/purchases?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Non-JSON response from purchases API, using fallback');
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
        const purchases = Array.isArray(rawData) ? rawData.map(transformBackendPurchase) : [];
        return { 
          success: true, 
          data: {
            data: purchases,
            total: result.data?.total || purchases.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch purchases' };
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch purchases' 
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Purchase>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendPurchase(result.data) };
      }
      return { success: false, error: result.error || 'Purchase not found' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch purchase' 
      };
    }
  },

  async create(data: CreatePurchaseDTO): Promise<ApiResponse<Purchase>> {
    try {
      const payload = transformToBackend(data);

      const response = await fetch(`${API_BASE_URL}/api/purchases`, {
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
        return { success: true, data: transformBackendPurchase(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create purchase' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create purchase' 
      };
    }
  },

  async update(id: string, data: Partial<UpdatePurchaseDTO>): Promise<ApiResponse<Purchase>> {
    try {
      const payload = {
        ...transformToBackend(data),
        status: data.status,
        payment_status: data.paymentStatus
      };

      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendPurchase(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update purchase' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update purchase' 
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}`, {
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
        error: error instanceof Error ? error.message : 'Failed to delete purchase' 
      };
    }
  },

  async getStats(): Promise<ApiResponse<PurchaseStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/stats/summary`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        // Fallback: compute stats from list
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const purchases = listResponse.data.data;
          return {
            success: true,
            data: {
              total: purchases.length,
              pending: purchases.filter(p => p.status === 'pending').length,
              received: purchases.filter(p => p.status === 'received').length,
              totalValue: purchases.reduce((sum, p) => sum + p.total, 0),
              unpaidValue: purchases.reduce((sum, p) => sum + p.remainingAmount, 0)
            }
          };
        }
        return { success: true, data: { total: 0, pending: 0, received: 0, totalValue: 0, unpaidValue: 0 } };
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { 
          success: true, 
          data: {
            total: result.data.total || 0,
            pending: result.data.pending || 0,
            received: result.data.received || 0,
            totalValue: result.data.total_value || result.data.totalValue || 0,
            unpaidValue: result.data.unpaid_value || result.data.unpaidValue || 0
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

  async updateStatus(id: string, status: string): Promise<ApiResponse<Purchase>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendPurchase(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update status' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update status' 
      };
    }
  },

  async markAsReceived(id: string): Promise<ApiResponse<Purchase>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received_date: new Date().toISOString() })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendPurchase(result.data) };
      }
      return { success: false, error: result.error || 'Failed to mark as received' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to mark as received' 
      };
    }
  },

  async addPayment(id: string, paymentData: Omit<PurchasePaymentHistory, 'id'>): Promise<ApiResponse<Purchase>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          payment_date: paymentData.date,
          payment_method: paymentData.method,
          reference: paymentData.reference
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendPurchase(result.data) };
      }
      return { success: false, error: result.error || 'Failed to add payment' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add payment' 
      };
    }
  }
};
