import { BaseApiService } from './base.service';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';

export interface Return {
  id: number;
  return_number: string;
  sale_id: number;
  customer_id: number;
  customer_name?: string;
  return_date: string;
  return_type: 'full' | 'partial';
  reason: 'defective' | 'wrong_item' | 'not_needed' | 'damaged' | 'other';
  notes?: string;
  total_amount: number;
  refund_amount: number;
  refund_status: 'pending' | 'processed' | 'cancelled';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  processed_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  items?: ReturnItem[];
}

export interface ReturnItem {
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
  condition: 'good' | 'damaged' | 'defective' | 'unopened';
  notes?: string;
}

export interface CreateReturnRequest {
  sale_id: number;
  customer_id: number;
  return_date: string;
  return_type: Return['return_type'];
  reason: Return['reason'];
  notes?: string;
  total_amount: number;
  items: Omit<ReturnItem, 'id' | 'return_id'>[];
}

export interface UpdateReturnRequest extends Partial<CreateReturnRequest> {
  status?: Return['status'];
  refund_status?: Return['refund_status'];
}

export interface ProcessReturnRequest {
  status: 'approved' | 'rejected';
  refund_amount?: number;
  refund_method_id?: number;
  notes?: string;
}

export interface ReturnStats {
  total_returns: number;
  total_amount: number;
  total_refunded: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  completed_count: number;
  full_returns_count: number;
  partial_returns_count: number;
}

class ReturnApiService extends BaseApiService {
  constructor() {
    super('/api/returns');
  }

  async getReturns(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Return>>> {
    return this.get<PaginatedResponse<Return>>('', params);
  }

  async getReturnById(id: number): Promise<ApiResponse<Return>> {
    return this.get<Return>(`/${id}`);
  }

  async createReturn(data: CreateReturnRequest): Promise<ApiResponse<Return>> {
    return this.post<Return>('', data);
  }

  async updateReturn(id: number, data: UpdateReturnRequest): Promise<ApiResponse<Return>> {
    return this.put<Return>(`/${id}`, data);
  }

  async deleteReturn(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/${id}`);
  }

  async processReturn(id: number, data: ProcessReturnRequest): Promise<ApiResponse<Return>> {
    return this.post<Return>(`/${id}/process`, data);
  }

  async getReturnStats(filters?: { start_date?: string; end_date?: string }): Promise<ApiResponse<ReturnStats>> {
    return this.get<ReturnStats>('/stats', filters);
  }

  async getReturnReport(filters?: QueryParams): Promise<ApiResponse<any>> {
    return this.get<any>('/report', filters);
  }

  // Sale-specific return methods
  async getSaleReturns(saleId: number): Promise<ApiResponse<Return[]>> {
    return this.get<Return[]>(`/sale/${saleId}`);
  }

  async getSaleStateBeforeReturn(saleId: number, returnId?: number): Promise<ApiResponse<any>> {
    const endpoint = returnId 
      ? `/sale/${saleId}/state/before/${returnId}`
      : `/sale/${saleId}/state/before`;
    return this.get<any>(endpoint);
  }

  async getSaleStateAfterReturn(saleId: number, returnId: number): Promise<ApiResponse<any>> {
    return this.get<any>(`/sale/${saleId}/state/after/${returnId}`);
  }
}

export const returnApiService = new ReturnApiService();