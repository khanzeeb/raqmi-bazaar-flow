import { BaseApiService } from './base.service';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';

export interface Sale {
  id: number;
  sale_number: string;
  customer_id: number;
  customer_name?: string;
  sale_date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
}

export interface CreateSaleRequest {
  customer_id: number;
  sale_date: string;
  due_date: string;
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
  items: Omit<SaleItem, 'id' | 'sale_id'>[];
}

export interface UpdateSaleRequest extends Partial<CreateSaleRequest> {
  status?: Sale['status'];
  payment_status?: Sale['payment_status'];
}

export interface SalePaymentRequest {
  amount: number;
  payment_method_id: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export interface SaleStats {
  total_sales: number;
  total_revenue: number;
  total_collected: number;
  total_outstanding: number;
  unpaid_count: number;
  partially_paid_count: number;
  paid_count: number;
  overpaid_count: number;
  average_sale_amount: number;
}

class SaleApiService extends BaseApiService {
  constructor() {
    super('/api/sales');
  }

  async getSales(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Sale>>> {
    return this.get<PaginatedResponse<Sale>>('', params);
  }

  async getSaleById(id: number): Promise<ApiResponse<Sale>> {
    return this.get<Sale>(`/${id}`);
  }

  async createSale(data: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    return this.post<Sale>('', data);
  }

  async updateSale(id: number, data: UpdateSaleRequest): Promise<ApiResponse<Sale>> {
    return this.put<Sale>(`/${id}`, data);
  }

  async deleteSale(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/${id}`);
  }

  async getSaleStats(filters?: { start_date?: string; end_date?: string }): Promise<ApiResponse<SaleStats>> {
    return this.get<SaleStats>('/stats', filters);
  }

  async getOverdueSales(): Promise<ApiResponse<Sale[]>> {
    return this.get<Sale[]>('/overdue');
  }

  async getSaleReport(filters?: QueryParams): Promise<ApiResponse<any>> {
    return this.get<any>('/report', filters);
  }

  // Payment related methods
  async createSalePayment(saleId: number, data: SalePaymentRequest): Promise<ApiResponse<any>> {
    return this.post<any>(`/${saleId}/payments`, data);
  }

  async createPartialPayment(saleId: number, data: SalePaymentRequest): Promise<ApiResponse<any>> {
    return this.post<any>(`/${saleId}/payments/partial`, data);
  }

  async createFullPayment(saleId: number, data: SalePaymentRequest): Promise<ApiResponse<any>> {
    return this.post<any>(`/${saleId}/payments/full`, data);
  }

  async allocatePayment(saleId: number, paymentId: number, amount: number): Promise<ApiResponse<any>> {
    return this.post<any>(`/${saleId}/allocate-payment`, { payment_id: paymentId, amount });
  }

  // Sale management
  async cancelSale(saleId: number, reason?: string): Promise<ApiResponse<Sale>> {
    return this.post<Sale>(`/${saleId}/cancel`, { reason });
  }

  async processOverdueReminders(): Promise<ApiResponse<any>> {
    return this.post<any>('/process-overdue-reminders');
  }

  // Return related methods
  async getSaleReturns(saleId: number): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/${saleId}/returns`);
  }

  async getSaleStateBeforeReturn(saleId: number, returnId?: number): Promise<ApiResponse<any>> {
    const endpoint = returnId 
      ? `/${saleId}/state/before-return/${returnId}`
      : `/${saleId}/state/before-return`;
    return this.get<any>(endpoint);
  }

  async getSaleStateAfterReturn(saleId: number, returnId: number): Promise<ApiResponse<any>> {
    return this.get<any>(`/${saleId}/state/after-return/${returnId}`);
  }
}

export const saleApiService = new SaleApiService();