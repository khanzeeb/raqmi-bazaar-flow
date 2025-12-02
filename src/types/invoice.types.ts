// Invoice Types - Single source of truth

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceLanguage = 'ar' | 'en' | 'both';

export interface InvoiceCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  type: 'individual' | 'business';
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceCustomFields {
  poNumber?: string;
  deliveryTerms?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  language: InvoiceLanguage;
  qrCode?: string;
  notes?: string;
  customFields?: InvoiceCustomFields;
}

export interface CreateInvoiceDTO {
  invoiceNumber: string;
  customer: InvoiceCustomer;
  items: Omit<InvoiceItem, 'id'>[];
  taxRate: number;
  discount: number;
  dueDate: string;
  paymentTerms: string;
  currency?: string;
  language?: InvoiceLanguage;
  notes?: string;
  customFields?: InvoiceCustomFields;
}

export interface UpdateInvoiceDTO extends Partial<CreateInvoiceDTO> {
  id: string;
  status?: InvoiceStatus;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  search?: string;
  dateRange?: { start: string; end: string };
}

export interface InvoiceStats {
  total: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  count: number;
}
