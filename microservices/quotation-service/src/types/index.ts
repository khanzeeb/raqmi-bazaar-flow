export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export enum QuotationAction {
  CREATED = 'created',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CONVERTED_TO_SALE = 'converted_to_sale',
  UPDATED = 'updated',
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_type: 'individual' | 'business';
  quotation_date: Date;
  validity_date: Date;
  validity_days: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: QuotationStatus;
  notes?: string;
  terms_conditions?: string;
  converted_to_sale_id?: string;
  decline_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationHistory {
  id: string;
  quotation_id: string;
  action: QuotationAction;
  notes?: string;
  performed_by?: string;
  timestamp: Date;
}

export interface CreateQuotationItemInput {
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
}

export interface CreateQuotationInput {
  customer: {
    name: string;
    phone: string;
    email?: string;
    type?: 'individual' | 'business';
  };
  customer_id?: string;
  quotation_date?: string;
  validity_days?: number;
  tax_rate?: number;
  discount?: number;
  notes?: string;
  terms_conditions?: string;
  currency?: string;
  items: CreateQuotationItemInput[];
}

export interface UpdateQuotationInput extends Partial<CreateQuotationInput> {
  status?: QuotationStatus;
}

export interface QuotationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
