import { BaseApiService } from './base.service';
import { ApiResponse, QueryParams } from '@/types/api';

export interface QuotationItem {
  id?: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  line_total: number;
}

export interface Quotation {
  id: number;
  quotation_number: string;
  customer_id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  quotation_date: string;
  validity_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';
  notes?: string;
  terms_conditions?: string;
  items: QuotationItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateQuotationData {
  customer_id: number;
  quotation_date: string;
  validity_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
  items: Omit<QuotationItem, 'id' | 'line_total'>[];
}

export interface UpdateQuotationData extends Partial<CreateQuotationData> {
  status?: Quotation['status'];
}

export interface QuotationStats {
  total_quotations: number;
  total_value: number;
  draft_count: number;
  sent_count: number;
  accepted_count: number;
  declined_count: number;
  expired_count: number;
  converted_count: number;
  average_quotation_amount: number;
}

export interface QuotationFilters extends QueryParams {
  customer_id?: number;
  status?: Quotation['status'];
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class QuotationService extends BaseApiService {
  constructor() {
    super('/api/quotations');
  }

  async getQuotations(filters?: QuotationFilters): Promise<ApiResponse<{
    data: Quotation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return this.get('', filters);
  }

  async getQuotation(id: number): Promise<ApiResponse<Quotation>> {
    return this.get(`/${id}`);
  }

  async createQuotation(data: CreateQuotationData): Promise<ApiResponse<Quotation>> {
    return this.post('', data);
  }

  async updateQuotation(id: number, data: UpdateQuotationData): Promise<ApiResponse<Quotation>> {
    return this.put(`/${id}`, data);
  }

  async deleteQuotation(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  async getStats(filters?: Pick<QuotationFilters, 'date_from' | 'date_to'>): Promise<ApiResponse<QuotationStats>> {
    return this.get('/stats', filters);
  }

  async sendQuotation(id: number): Promise<ApiResponse<Quotation>> {
    return this.post(`/${id}/send`);
  }

  async acceptQuotation(id: number): Promise<ApiResponse<Quotation>> {
    return this.post(`/${id}/accept`);
  }

  async declineQuotation(id: number, reason?: string): Promise<ApiResponse<Quotation>> {
    return this.post(`/${id}/decline`, { reason });
  }

  async convertToSale(id: number): Promise<ApiResponse<any>> {
    return this.post(`/${id}/convert-to-sale`);
  }

  async updateStatus(id: number, status: Quotation['status']): Promise<ApiResponse<Quotation>> {
    return this.patch(`/${id}/status`, { status });
  }

  async getExpiredQuotations(): Promise<ApiResponse<Quotation[]>> {
    return this.get('/expired');
  }

  async getReport(filters?: QuotationFilters): Promise<ApiResponse<{
    quotations: Quotation[];
    statistics: QuotationStats;
    summary: {
      total_quotations: number;
      date_range: {
        from?: string;
        to?: string;
      };
    };
  }>> {
    return this.get('/report', filters);
  }

  async processExpiredQuotations(): Promise<ApiResponse<{ processed_count: number }>> {
    return this.post('/process-expired');
  }
}

export const quotationService = new QuotationService();