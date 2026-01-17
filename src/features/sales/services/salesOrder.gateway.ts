// Sales Order Gateway - API integration for sales order operations
import { ApiResponse } from '@/types/api';
import { SalesOrder, SalesOrderFilters, SalesOrderStats } from '@/types/salesOrder.types';

const API_BASE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:3002';

interface SalesOrdersResponse {
  data: SalesOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateSalesOrderDTO {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType: 'individual' | 'business';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  taxRate: number;
  discount?: number;
  notes?: string;
  paymentMode: 'cash' | 'bank_transfer' | 'credit';
}

interface BackendOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerType?: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Transform backend order to frontend SalesOrder type
const transformBackendOrder = (order: BackendOrder): SalesOrder => ({
  id: order.id,
  orderNumber: order.orderNumber,
  customer: {
    name: order.customerName,
    phone: order.customerPhone || '',
    type: (order.customerType as 'individual' | 'business') || 'individual'
  },
  items: order.items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.unitPrice,
    total: item.total
  })),
  subtotal: order.subtotal,
  taxRate: order.taxRate,
  taxAmount: order.taxAmount,
  discount: order.discountAmount,
  total: order.totalAmount,
  paymentMode: mapPaymentMethod(order.paymentMethod),
  paymentStatus: mapPaymentStatus(order.paymentStatus),
  paidAmount: order.paidAmount,
  status: mapOrderStatus(order.status),
  createdAt: order.createdAt.split('T')[0],
  notes: order.notes
});

const mapPaymentMethod = (method: string): 'cash' | 'bank_transfer' | 'credit' => {
  const methodMap: Record<string, 'cash' | 'bank_transfer' | 'credit'> = {
    'CASH': 'cash',
    'BANK_TRANSFER': 'bank_transfer',
    'CREDIT': 'credit',
    'cash': 'cash',
    'bank_transfer': 'bank_transfer',
    'credit': 'credit'
  };
  return methodMap[method] || 'cash';
};

const mapPaymentStatus = (status: string): 'pending' | 'partial' | 'paid' => {
  const statusMap: Record<string, 'pending' | 'partial' | 'paid'> = {
    'UNPAID': 'pending',
    'PARTIALLY_PAID': 'partial',
    'PAID': 'paid',
    'OVERPAID': 'paid',
    'pending': 'pending',
    'partial': 'partial',
    'paid': 'paid'
  };
  return statusMap[status] || 'pending';
};

const mapOrderStatus = (status: string): 'pending' | 'completed' | 'returned' => {
  const statusMap: Record<string, 'pending' | 'completed' | 'returned'> = {
    'PENDING': 'pending',
    'CONFIRMED': 'pending',
    'PROCESSING': 'pending',
    'COMPLETED': 'completed',
    'CANCELLED': 'returned',
    'RETURNED': 'returned',
    'pending': 'pending',
    'completed': 'completed',
    'returned': 'returned'
  };
  return statusMap[status] || 'pending';
};

export interface ISalesOrderGateway {
  getAll(filters?: Partial<SalesOrderFilters> & { page?: number; limit?: number }): Promise<ApiResponse<SalesOrdersResponse>>;
  getById(id: string): Promise<ApiResponse<SalesOrder>>;
  create(data: CreateSalesOrderDTO): Promise<ApiResponse<SalesOrder>>;
  update(id: string, data: Partial<CreateSalesOrderDTO>): Promise<ApiResponse<SalesOrder>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<SalesOrderStats>>;
  addPayment(id: string, amount: number, method: string): Promise<ApiResponse<SalesOrder>>;
  cancel(id: string, reason?: string): Promise<ApiResponse<SalesOrder>>;
}

export const salesOrderGateway: ISalesOrderGateway = {
  async getAll(filters?: Partial<SalesOrderFilters> & { page?: number; limit?: number }): Promise<ApiResponse<SalesOrdersResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.searchTerm) params.set('search', filters.searchTerm);
      if (filters?.selectedStatus && filters.selectedStatus !== 'all') {
        params.set('status', filters.selectedStatus.toUpperCase());
      }
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/sales?${params.toString()}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Non-JSON response from sales API, using fallback');
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
        const orders = (result.data?.data || result.data || []).map(transformBackendOrder);
        return { 
          success: true, 
          data: {
            data: orders,
            total: result.data?.total || orders.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch sales orders' };
    } catch (error) {
      console.error('Failed to fetch sales orders:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch sales orders' 
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<SalesOrder>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendOrder(result.data) };
      }
      return { success: false, error: result.error || 'Order not found' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order' 
      };
    }
  },

  async create(data: CreateSalesOrderDTO): Promise<ApiResponse<SalesOrder>> {
    try {
      const payload = {
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerType: data.customerType,
        items: data.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.quantity * item.price
        })),
        subtotal: data.subtotal,
        taxRate: data.taxRate,
        discountAmount: data.discount || 0,
        paymentMethod: data.paymentMode.toUpperCase(),
        notes: data.notes
      };

      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendOrder(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create order' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      };
    }
  },

  async update(id: string, data: Partial<CreateSalesOrderDTO>): Promise<ApiResponse<SalesOrder>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendOrder(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update order' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order' 
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true, data: undefined };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete order' 
      };
    }
  },

  async getStats(): Promise<ApiResponse<SalesOrderStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/stats`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        // Return default stats if backend is unavailable
        return { 
          success: true, 
          data: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0 } 
        };
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false) {
        const stats = result.data || result;
        return { 
          success: true, 
          data: {
            totalOrders: stats.totalOrders || stats.total_sales || 0,
            pendingOrders: stats.pendingOrders || stats.pending_count || 0,
            completedOrders: stats.completedOrders || stats.completed_count || 0,
            totalRevenue: stats.totalRevenue || stats.total_revenue || 0
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

  async addPayment(id: string, amount: number, method: string): Promise<ApiResponse<SalesOrder>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethod: method })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendOrder(result.data) };
      }
      return { success: false, error: result.error || 'Failed to add payment' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add payment' 
      };
    }
  },

  async cancel(id: string, reason?: string): Promise<ApiResponse<SalesOrder>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendOrder(result.data) };
      }
      return { success: false, error: result.error || 'Failed to cancel order' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel order' 
      };
    }
  }
};
