// Quotation Gateway - API integration for quotation operations
import { apiGateway } from '@/lib/api/gateway';
import { Quotation, QuotationFilters, CreateQuotationDTO, QuotationStats, QuotationItem } from '@/types/quotation.types';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_QUOTATION_SERVICE_URL || 'http://localhost:3004';

interface QuotationsResponse {
  data: Quotation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ConvertToSaleResponse {
  quotation: Quotation;
  saleOrderId: string;
}

export interface IQuotationGateway {
  getAll(filters?: QuotationFilters): Promise<ApiResponse<QuotationsResponse>>;
  getById(id: string): Promise<ApiResponse<Quotation>>;
  create(data: CreateQuotationDTO): Promise<ApiResponse<Quotation>>;
  update(id: string, data: Partial<CreateQuotationDTO>): Promise<ApiResponse<Quotation>>;
  delete(id: string): Promise<ApiResponse<void>>;
  send(id: string): Promise<ApiResponse<Quotation>>;
  accept(id: string): Promise<ApiResponse<Quotation>>;
  decline(id: string, reason?: string): Promise<ApiResponse<Quotation>>;
  convertToSale(id: string): Promise<ApiResponse<ConvertToSaleResponse>>;
  updateStatus(id: string, status: Quotation['status']): Promise<ApiResponse<Quotation>>;
  getStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<ApiResponse<QuotationStats>>;
  getExpired(): Promise<ApiResponse<Quotation[]>>;
  processExpired(): Promise<ApiResponse<{ processed_count: number }>>;
  getReport(filters?: QuotationFilters): Promise<ApiResponse<{
    quotations: Quotation[];
    statistics: QuotationStats;
    summary: { total_quotations: number; date_range: { from?: string; to?: string } };
  }>>;
  generateQuotationNumber(): Promise<ApiResponse<{ quotationNumber: string }>>;
}

export const quotationGateway: IQuotationGateway = {
  async getAll(filters?: QuotationFilters): Promise<ApiResponse<QuotationsResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());
      if (filters?.dateRange?.start) params.set('date_from', filters.dateRange.start);
      if (filters?.dateRange?.end) params.set('date_to', filters.dateRange.end);

      const response = await fetch(`${API_BASE_URL}/api/quotations?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to fetch quotations' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch quotations' 
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Quotation not found' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch quotation' 
      };
    }
  },

  async create(data: CreateQuotationDTO): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to create quotation' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create quotation' 
      };
    }
  },

  async update(id: string, data: Partial<CreateQuotationDTO>): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to update quotation' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update quotation' 
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete quotation' 
      };
    }
  },

  async send(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/send`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to send quotation' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send quotation' 
      };
    }
  },

  async accept(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/accept`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to accept quotation' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to accept quotation' 
      };
    }
  },

  async decline(id: string, reason?: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to decline quotation' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to decline quotation' 
      };
    }
  },

  async convertToSale(id: string): Promise<ApiResponse<ConvertToSaleResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/convert-to-sale`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to convert quotation' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to convert quotation' 
      };
    }
  },

  async updateStatus(id: string, status: Quotation['status']): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to update status' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update status' 
      };
    }
  },

  async getStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<ApiResponse<QuotationStats>> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.set('date_from', filters.dateFrom);
      if (filters?.dateTo) params.set('date_to', filters.dateTo);

      const response = await fetch(`${API_BASE_URL}/api/quotations/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stats' 
      };
    }
  },

  async getExpired(): Promise<ApiResponse<Quotation[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/expired`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to fetch expired quotations' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch expired quotations' 
      };
    }
  },

  async processExpired(): Promise<ApiResponse<{ processed_count: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/process-expired`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to process expired quotations' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process expired quotations' 
      };
    }
  },

  async getReport(filters?: QuotationFilters): Promise<ApiResponse<{
    quotations: Quotation[];
    statistics: QuotationStats;
    summary: {
      total_quotations: number;
      date_range: { from?: string; to?: string };
    };
  }>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());
      if (filters?.dateRange?.start) params.set('date_from', filters.dateRange.start);
      if (filters?.dateRange?.end) params.set('date_to', filters.dateRange.end);

      const response = await fetch(`${API_BASE_URL}/api/quotations/report?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Failed to fetch report' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch report' 
      };
    }
  },

  async generateQuotationNumber(): Promise<ApiResponse<{ quotationNumber: string }>> {
    // Generate quotation number client-side as backend doesn't have dedicated endpoint
    // This follows the pattern: QT-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `QT-${dateStr}-${randomSuffix}`;
    return { success: true, data: { quotationNumber } };
  }
};
