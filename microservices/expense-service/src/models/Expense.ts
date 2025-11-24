export interface Expense {
  id: string;
  expense_number: string;
  expense_date: Date;
  title: string;
  description?: string;
  category: 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'travel' | 'meals' | 'software' | 'equipment' | 'professional_services' | 'insurance' | 'taxes' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card';
  vendor?: string;
  receipt_url?: string;
  receipt_attached: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  vendor?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseCreateDTO {
  expense_date: Date;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency?: string;
  payment_method: string;
  vendor?: string;
  notes?: string;
}

export interface ExpenseUpdateDTO {
  expense_date?: Date;
  title?: string;
  description?: string;
  category?: string;
  amount?: number;
  payment_method?: string;
  vendor?: string;
  notes?: string;
}
