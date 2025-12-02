// Purchase Types - Single source of truth

export type PurchaseStatus = 'pending' | 'received' | 'partial' | 'returned';
export type PurchasePaymentMethod = 'full' | 'partial' | 'credit';
export type PurchasePaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface PurchaseSupplier {
  name: string;
  phone: string;
  email?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchasePaymentHistory {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank_transfer' | 'check';
  reference?: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplier: PurchaseSupplier;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: PurchaseStatus;
  paymentMethod: PurchasePaymentMethod;
  paymentStatus: PurchasePaymentStatus;
  paidAmount: number;
  remainingAmount: number;
  addedToInventory?: boolean;
  paymentHistory: PurchasePaymentHistory[];
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface CreatePurchaseDTO {
  purchaseNumber: string;
  supplier: PurchaseSupplier;
  items: Omit<PurchaseItem, 'id'>[];
  paymentMethod: PurchasePaymentMethod;
  expectedDate?: string;
  notes?: string;
}

export interface UpdatePurchaseDTO extends Partial<CreatePurchaseDTO> {
  id: string;
  status?: PurchaseStatus;
  paymentStatus?: PurchasePaymentStatus;
}

export interface PurchaseFilters {
  status?: PurchaseStatus;
  paymentStatus?: PurchasePaymentStatus;
  search?: string;
  dateRange?: { start: string; end: string };
}

export interface PurchaseStats {
  total: number;
  pending: number;
  received: number;
  totalValue: number;
  unpaidValue: number;
}
