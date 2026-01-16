/**
 * Sale Data Transfer Objects
 * Single Responsibility: Define data structures for sale operations
 */

export interface CreateSaleDTO {
  customer_id: string;
  sale_date: string;
  due_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface UpdateSaleDTO extends Partial<CreateSaleDTO> {
  status?: SaleStatus;
}

export interface SaleItemDTO {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
}

export interface SalePaymentDTO {
  amount: number;
  payment_method_code: string;
  payment_date: string;
  reference?: string;
  notes?: string;
}

export interface SaleFiltersDTO {
  customer_id?: string;
  status?: SaleStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type SaleStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid';

export interface SaleResponseDTO {
  id: string;
  sale_number: string;
  customer_id: string;
  sale_date: string;
  due_date: string;
  status: SaleStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  currency: string;
  notes?: string;
  terms_conditions?: string;
  items?: SaleItemDTO[];
  created_at: string;
  updated_at: string;
}
