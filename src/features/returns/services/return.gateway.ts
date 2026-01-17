// Return Gateway - API integration for return operations
import { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_RETURN_SERVICE_URL || 'http://localhost:3010';

export interface Return {
  id: number;
  returnNumber: string;
  saleNumber: string;
  saleId: number;
  customerId: number;
  customerName: string;
  returnDate: string;
  returnType: 'full' | 'partial';
  reason: 'defective' | 'wrong_item' | 'not_needed' | 'damaged' | 'other';
  notes?: string;
  totalAmount: number;
  refundAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refundStatus: 'pending' | 'processed' | 'cancelled';
  items?: ReturnItem[];
}

export interface ReturnItem {
  id: number;
  returnId: number;
  saleItemId: number;
  productId: number;
  productName: string;
  productSku?: string;
  quantityReturned: number;
  originalQuantity: number;
  unitPrice: number;
  lineTotal: number;
  condition: 'good' | 'damaged' | 'defective' | 'unopened';
  notes?: string;
}

interface ReturnsResponse {
  data: Return[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ReturnStats {
  totalReturns: number;
  totalAmount: number;
  totalRefunded: number;
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
  rejectedCount: number;
}

interface BackendReturn {
  id: number;
  return_number: string;
  sale_id: number;
  sale_number?: string;
  customer_id: number;
  customer_name?: string;
  return_date: string;
  return_type: 'full' | 'partial';
  reason: string;
  notes?: string;
  total_amount: number;
  refund_amount: number;
  refund_status: string;
  status: string;
  processed_by?: number;
  processed_at?: string;
  items?: BackendReturnItem[];
  created_at: string;
  updated_at: string;
}

interface BackendReturnItem {
  id: number;
  return_id: number;
  sale_item_id: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity_returned: number;
  original_quantity: number;
  unit_price: number;
  line_total: number;
  condition: string;
  notes?: string;
}

const transformBackendReturn = (ret: BackendReturn): Return => ({
  id: ret.id,
  returnNumber: ret.return_number,
  saleNumber: ret.sale_number || `SALE-${ret.sale_id}`,
  saleId: ret.sale_id,
  customerId: ret.customer_id,
  customerName: ret.customer_name || '',
  returnDate: ret.return_date?.split('T')[0] || '',
  returnType: ret.return_type,
  reason: mapReason(ret.reason),
  notes: ret.notes,
  totalAmount: ret.total_amount,
  refundAmount: ret.refund_amount,
  status: mapStatus(ret.status),
  refundStatus: mapRefundStatus(ret.refund_status),
  items: (ret.items || []).map(item => ({
    id: item.id,
    returnId: item.return_id,
    saleItemId: item.sale_item_id,
    productId: item.product_id,
    productName: item.product_name,
    productSku: item.product_sku,
    quantityReturned: item.quantity_returned,
    originalQuantity: item.original_quantity,
    unitPrice: item.unit_price,
    lineTotal: item.line_total,
    condition: mapCondition(item.condition),
    notes: item.notes
  }))
});

const mapStatus = (status: string): Return['status'] => {
  const statusMap: Record<string, Return['status']> = {
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'completed': 'completed'
  };
  return statusMap[status] || 'pending';
};

const mapRefundStatus = (status: string): Return['refundStatus'] => {
  const statusMap: Record<string, Return['refundStatus']> = {
    'pending': 'pending',
    'processed': 'processed',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || 'pending';
};

const mapReason = (reason: string): Return['reason'] => {
  const reasonMap: Record<string, Return['reason']> = {
    'defective': 'defective',
    'wrong_item': 'wrong_item',
    'not_needed': 'not_needed',
    'damaged': 'damaged',
    'other': 'other'
  };
  return reasonMap[reason] || 'other';
};

const mapCondition = (condition: string): ReturnItem['condition'] => {
  const conditionMap: Record<string, ReturnItem['condition']> = {
    'good': 'good',
    'damaged': 'damaged',
    'defective': 'defective',
    'unopened': 'unopened'
  };
  return conditionMap[condition] || 'good';
};

const transformToBackend = (data: Partial<Return>) => ({
  sale_id: data.saleId,
  customer_id: data.customerId,
  return_date: data.returnDate,
  return_type: data.returnType,
  reason: data.reason,
  notes: data.notes,
  total_amount: data.totalAmount,
  items: data.items?.map(item => ({
    sale_item_id: item.saleItemId,
    product_id: item.productId,
    product_name: item.productName,
    product_sku: item.productSku,
    quantity_returned: item.quantityReturned,
    original_quantity: item.originalQuantity,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
    condition: item.condition,
    notes: item.notes
  }))
});

export interface IReturnGateway {
  getAll(filters?: { search?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<ReturnsResponse>>;
  getById(id: number): Promise<ApiResponse<Return>>;
  create(data: Omit<Return, 'id' | 'returnNumber'>): Promise<ApiResponse<Return>>;
  update(id: number, data: Partial<Return>): Promise<ApiResponse<Return>>;
  delete(id: number): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<ReturnStats>>;
  approveReturn(id: number): Promise<ApiResponse<Return>>;
  rejectReturn(id: number, notes?: string): Promise<ApiResponse<Return>>;
  completeReturn(id: number): Promise<ApiResponse<Return>>;
  getSaleReturns(saleId: number): Promise<ApiResponse<Return[]>>;
}

export const returnGateway: IReturnGateway = {
  async getAll(filters?): Promise<ApiResponse<ReturnsResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/returns?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } };
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const returns = Array.isArray(rawData) ? rawData.map(transformBackendReturn) : [];
        return { 
          success: true, 
          data: {
            data: returns,
            total: result.data?.total || returns.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch returns' };
    } catch (error) {
      console.error('Failed to fetch returns:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch returns' };
    }
  },

  async getById(id: number): Promise<ApiResponse<Return>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendReturn(result.data) };
      }
      return { success: false, error: result.error || 'Return not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch return' };
    }
  },

  async create(data): Promise<ApiResponse<Return>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns`, {
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
        return { success: true, data: transformBackendReturn(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create return' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create return' };
    }
  },

  async update(id: number, data): Promise<ApiResponse<Return>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendReturn(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update return' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update return' };
    }
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete return' };
    }
  },

  async getStats(): Promise<ApiResponse<ReturnStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/stats`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const returns = listResponse.data.data;
          return {
            success: true,
            data: {
              totalReturns: returns.length,
              totalAmount: returns.reduce((sum, r) => sum + r.totalAmount, 0),
              totalRefunded: returns.reduce((sum, r) => sum + r.refundAmount, 0),
              pendingCount: returns.filter(r => r.status === 'pending').length,
              approvedCount: returns.filter(r => r.status === 'approved').length,
              completedCount: returns.filter(r => r.status === 'completed').length,
              rejectedCount: returns.filter(r => r.status === 'rejected').length
            }
          };
        }
        return { success: true, data: { totalReturns: 0, totalAmount: 0, totalRefunded: 0, pendingCount: 0, approvedCount: 0, completedCount: 0, rejectedCount: 0 } };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { 
          success: true, 
          data: {
            totalReturns: result.data.total_returns || result.data.totalReturns || 0,
            totalAmount: result.data.total_amount || result.data.totalAmount || 0,
            totalRefunded: result.data.total_refunded || result.data.totalRefunded || 0,
            pendingCount: result.data.pending_count || result.data.pendingCount || 0,
            approvedCount: result.data.approved_count || result.data.approvedCount || 0,
            completedCount: result.data.completed_count || result.data.completedCount || 0,
            rejectedCount: result.data.rejected_count || result.data.rejectedCount || 0
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },

  async approveReturn(id: number): Promise<ApiResponse<Return>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/${id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendReturn(result.data) };
      }
      return { success: false, error: result.error || 'Failed to approve return' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to approve return' };
    }
  },

  async rejectReturn(id: number, notes?: string): Promise<ApiResponse<Return>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/${id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', notes })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendReturn(result.data) };
      }
      return { success: false, error: result.error || 'Failed to reject return' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to reject return' };
    }
  },

  async completeReturn(id: number): Promise<ApiResponse<Return>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendReturn(result.data) };
      }
      return { success: false, error: result.error || 'Failed to complete return' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to complete return' };
    }
  },

  async getSaleReturns(saleId: number): Promise<ApiResponse<Return[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/returns/sale/${saleId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        const returns = Array.isArray(result.data) ? result.data.map(transformBackendReturn) : [];
        return { success: true, data: returns };
      }
      return { success: false, error: result.error || 'Failed to fetch sale returns' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch sale returns' };
    }
  }
};
