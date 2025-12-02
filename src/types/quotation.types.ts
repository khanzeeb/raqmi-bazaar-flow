// Quotation Types - Single source of truth

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'expired';

export interface QuotationCustomer {
  name: string;
  phone: string;
  email?: string;
  type: 'individual' | 'business';
}

export interface QuotationItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface QuotationHistoryEntry {
  id: string;
  action: 'created' | 'sent' | 'accepted' | 'expired' | 'converted_to_sale';
  timestamp: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customer: QuotationCustomer;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  validityDays: number;
  expiryDate: string;
  status: QuotationStatus;
  createdAt: string;
  notes?: string;
  history: QuotationHistoryEntry[];
  convertedToSaleId?: string;
}

export interface CreateQuotationDTO {
  quotationNumber: string;
  customer: QuotationCustomer;
  items: Omit<QuotationItem, 'id'>[];
  taxRate: number;
  discount: number;
  validityDays: number;
  notes?: string;
}

export interface UpdateQuotationDTO extends Partial<CreateQuotationDTO> {
  id: string;
  status?: QuotationStatus;
}

export interface QuotationFilters {
  status?: QuotationStatus;
  search?: string;
  dateRange?: { start: string; end: string };
}

export interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  expired: number;
  totalValue: number;
}
