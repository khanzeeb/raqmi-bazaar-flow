// Payment Types - Single source of truth

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit' | 'check';

export interface PaymentAllocation {
  orderId: string;
  orderNumber: string;
  allocatedAmount: number;
  orderTotal: number;
  previouslyPaid: number;
  remainingAfterPayment: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  relatedOrderIds: string[];
  allocations: PaymentAllocation[];
  createdAt: string;
}

export interface CustomerCredit {
  customerId: string;
  customerName: string;
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  overdueAmount: number;
  totalOutstanding: number;
  creditStatus: 'good' | 'warning' | 'blocked';
}

export interface CreatePaymentDTO {
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
  allocations: Omit<PaymentAllocation, 'remainingAfterPayment'>[];
}

export interface UpdatePaymentDTO extends Partial<CreatePaymentDTO> {
  id: string;
  status?: PaymentStatus;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  customerId?: string;
  search?: string;
  dateRange?: { start: string; end: string };
}

export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  totalOutstanding: number;
  blockedCustomers: number;
}
