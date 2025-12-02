// Expense Types - Single source of truth

export type ExpenseCategory = 'rent' | 'utilities' | 'transport' | 'office' | 'marketing' | 'maintenance' | 'other';
export type ExpenseStatus = 'pending' | 'approved' | 'paid';
export type ExpensePaymentMethod = 'cash' | 'bank_transfer' | 'card';

export interface Expense {
  id: string;
  expenseNumber: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  date: string;
  vendor?: string;
  receiptAttached: boolean;
  status: ExpenseStatus;
  notes?: string;
}

export interface CreateExpenseDTO {
  expenseNumber: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  date: string;
  vendor?: string;
  notes?: string;
}

export interface UpdateExpenseDTO extends Partial<CreateExpenseDTO> {
  id: string;
  status?: ExpenseStatus;
  receiptAttached?: boolean;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  search?: string;
  dateRange?: { start: string; end: string };
}

export interface ExpenseStats {
  totalExpenses: number;
  pending: number;
  paid: number;
  withReceipts: number;
}
