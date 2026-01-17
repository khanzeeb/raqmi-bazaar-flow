// Invoice Gateway - API integration for invoice operations
import { ApiResponse } from '@/types/api';
import { Invoice, InvoiceStatus } from '@/types/invoice.types';

const API_BASE_URL = import.meta.env.VITE_INVOICE_SERVICE_URL || 'http://localhost:3007';

interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InvoiceStats {
  total: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
}

interface BackendInvoice {
  id: string;
  invoice_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_tax_id?: string;
  customer_type?: 'individual' | 'business';
  items: BackendInvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  payment_terms?: string;
  currency?: string;
  language?: 'ar' | 'en' | 'both';
  qr_code?: string;
  notes?: string;
  po_number?: string;
  delivery_terms?: string;
  created_at: string;
  updated_at: string;
}

interface BackendInvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const transformBackendInvoice = (invoice: BackendInvoice): Invoice => ({
  id: invoice.id,
  invoiceNumber: invoice.invoice_number,
  customer: {
    name: invoice.customer_name,
    phone: invoice.customer_phone || '',
    email: invoice.customer_email,
    address: invoice.customer_address,
    taxId: invoice.customer_tax_id,
    type: invoice.customer_type || 'individual'
  },
  items: (invoice.items || []).map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.line_total
  })),
  subtotal: invoice.subtotal,
  taxRate: invoice.tax_rate,
  taxAmount: invoice.tax_amount,
  discount: invoice.discount_amount || 0,
  total: invoice.total_amount,
  status: mapStatus(invoice.status),
  issueDate: invoice.issue_date?.split('T')[0] || '',
  dueDate: invoice.due_date?.split('T')[0] || '',
  paymentTerms: invoice.payment_terms || '',
  currency: invoice.currency || 'SAR',
  language: invoice.language || 'ar',
  qrCode: invoice.qr_code,
  notes: invoice.notes,
  customFields: {
    poNumber: invoice.po_number,
    deliveryTerms: invoice.delivery_terms
  }
});

const mapStatus = (status: string): InvoiceStatus => {
  const statusMap: Record<string, InvoiceStatus> = {
    'draft': 'draft',
    'sent': 'sent',
    'paid': 'paid',
    'overdue': 'overdue',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || 'draft';
};

const transformToBackend = (data: Partial<Invoice>) => ({
  invoice_number: data.invoiceNumber,
  customer_name: data.customer?.name,
  customer_phone: data.customer?.phone,
  customer_email: data.customer?.email,
  customer_address: data.customer?.address,
  customer_tax_id: data.customer?.taxId,
  customer_type: data.customer?.type,
  items: data.items?.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.quantity * item.unitPrice
  })),
  tax_rate: data.taxRate,
  discount_amount: data.discount,
  due_date: data.dueDate,
  payment_terms: data.paymentTerms,
  currency: data.currency,
  language: data.language,
  notes: data.notes,
  po_number: data.customFields?.poNumber,
  delivery_terms: data.customFields?.deliveryTerms,
  status: data.status
});

export interface IInvoiceGateway {
  getAll(filters?: { search?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<InvoicesResponse>>;
  getById(id: string): Promise<ApiResponse<Invoice>>;
  create(data: Omit<Invoice, 'id'>): Promise<ApiResponse<Invoice>>;
  update(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<InvoiceStats>>;
  updateStatus(id: string, status: InvoiceStatus): Promise<ApiResponse<Invoice>>;
  markAsPaid(id: string): Promise<ApiResponse<Invoice>>;
  sendInvoice(id: string): Promise<ApiResponse<Invoice>>;
}

export const invoiceGateway: IInvoiceGateway = {
  async getAll(filters?): Promise<ApiResponse<InvoicesResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/invoices?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } };
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const invoices = Array.isArray(rawData) ? rawData.map(transformBackendInvoice) : [];
        return { 
          success: true, 
          data: {
            data: invoices,
            total: result.data?.total || invoices.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch invoices' };
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch invoices' };
    }
  },

  async getById(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendInvoice(result.data) };
      }
      return { success: false, error: result.error || 'Invoice not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch invoice' };
    }
  },

  async create(data): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
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
        return { success: true, data: transformBackendInvoice(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create invoice' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create invoice' };
    }
  },

  async update(id: string, data): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendInvoice(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update invoice' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update invoice' };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete invoice' };
    }
  },

  async getStats(): Promise<ApiResponse<InvoiceStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/stats`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const invoices = listResponse.data.data;
          return {
            success: true,
            data: {
              total: invoices.length,
              totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
              paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
              overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
              draft: invoices.filter(i => i.status === 'draft').length,
              sent: invoices.filter(i => i.status === 'sent').length,
              paid: invoices.filter(i => i.status === 'paid').length,
              overdue: invoices.filter(i => i.status === 'overdue').length
            }
          };
        }
        return { success: true, data: { total: 0, totalAmount: 0, paidAmount: 0, overdueAmount: 0, draft: 0, sent: 0, paid: 0, overdue: 0 } };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },

  async updateStatus(id: string, status): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendInvoice(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update status' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update status' };
    }
  },

  async markAsPaid(id: string): Promise<ApiResponse<Invoice>> {
    return this.updateStatus(id, 'paid');
  },

  async sendInvoice(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendInvoice(result.data) };
      }
      return { success: false, error: result.error || 'Failed to send invoice' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send invoice' };
    }
  }
};
