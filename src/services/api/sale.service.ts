// Re-export from unified gateway for backward compatibility
export { salesOrderGateway as saleApiService } from '@/features/sales/services/salesOrder.gateway';

// Legacy type exports for backward compatibility
export type { SalesOrder as Sale } from '@/types/salesOrder.types';

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
  status?: 'pending' | 'completed' | 'cancelled';
  payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
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
