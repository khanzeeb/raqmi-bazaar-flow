// Quotation Data Interface - Pure data structure
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
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';
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
  status?: QuotationData['status'];
  notes?: string;
  terms_conditions?: string;
}
