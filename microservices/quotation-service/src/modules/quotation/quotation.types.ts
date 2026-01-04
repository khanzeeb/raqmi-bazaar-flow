// Quotation Module Types

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';

export interface QuotationData {
  id: string;
  quotation_number: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  quotation_date: string;
  validity_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: QuotationStatus;
  notes?: string;
  terms_conditions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationFilters {
  customer_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateQuotationDTO {
  customer_id: string;
  quotation_date: string;
  validity_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface UpdateQuotationDTO {
  customer_id?: string;
  quotation_date?: string;
  validity_date?: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  status?: QuotationStatus;
  notes?: string;
  terms_conditions?: string;
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

export interface QuotationWithItems extends QuotationData {
  items: QuotationItemData[];
}

// Re-export item types for convenience
export interface QuotationItemData {
  id: string;
  quotation_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  current_product_name?: string;
  current_product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuotationItemDTO {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  description?: string;
}
