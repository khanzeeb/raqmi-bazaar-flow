import { BaseApiService } from './base.service';
import { ApiResponse, QueryParams, PaginatedResponse } from '@/types/api';

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string;
  supplier_name?: string;
  purchase_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  terms_conditions?: string;
  items?: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  received_quantity: number;
}

class PurchaseApiService extends BaseApiService {
  async getPurchases(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Purchase>>> {
    return this.get<PaginatedResponse<Purchase>>('/purchases', params);
  }

  async getPurchase(id: string): Promise<ApiResponse<Purchase>> {
    return this.get<Purchase>(`/purchases/${id}`);
  }

  async createPurchase(data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    return this.post<Purchase>('/purchases', data);
  }

  async updatePurchase(id: string, data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    return this.put<Purchase>(`/purchases/${id}`, data);
  }

  async deletePurchase(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/purchases/${id}`);
  }

  async getPurchaseStats(params?: QueryParams): Promise<ApiResponse<any>> {
    return this.get<any>('/purchases/stats', params);
  }

  async updateStatus(id: string, status: Purchase['status']): Promise<ApiResponse<Purchase>> {
    return this.patch<Purchase>(`/purchases/${id}/status`, { status });
  }

  async markAsReceived(id: string, data?: any): Promise<ApiResponse<Purchase>> {
    return this.post<Purchase>(`/purchases/${id}/receive`, data);
  }

  async addPayment(id: string, paymentData: any): Promise<ApiResponse<Purchase>> {
    return this.post<Purchase>(`/purchases/${id}/payment`, paymentData);
  }
}

export const purchaseApiService = new PurchaseApiService();