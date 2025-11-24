export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  issue_date: Date;
  due_date: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  total_amount: number;
  paid_amount: number;
  balance: number;
  notes?: string;
  terms?: string;
  payment_terms?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceDTO {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  issue_date: Date;
  due_date: Date;
  status?: 'draft' | 'sent';
  tax_rate: number;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  notes?: string;
  terms?: string;
  payment_terms?: string;
  items: CreateInvoiceItemDTO[];
}

export interface UpdateInvoiceDTO {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  issue_date?: Date;
  due_date?: Date;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  tax_rate?: number;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  notes?: string;
  terms?: string;
  payment_terms?: string;
  items?: CreateInvoiceItemDTO[];
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  customer_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface CreateInvoiceItemDTO {
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
}
