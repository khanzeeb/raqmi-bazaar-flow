// Expense Gateway - API integration for expense operations
import { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_EXPENSE_SERVICE_URL || 'http://localhost:3006';

export interface Expense {
  id: string;
  expenseNumber: string;
  category: 'rent' | 'utilities' | 'transport' | 'office' | 'marketing' | 'maintenance' | 'other';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'card';
  date: string;
  vendor?: string;
  receiptAttached: boolean;
  status: 'pending' | 'approved' | 'paid';
  notes?: string;
}

interface ExpensesResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ExpenseStats {
  totalExpenses: number;
  pending: number;
  approved: number;
  paid: number;
  totalAmount: number;
  withReceipts: number;
}

interface BackendExpense {
  id: string;
  expense_number: string;
  expense_date: string;
  title?: string;
  description?: string;
  category: string;
  amount: number;
  currency?: string;
  status: string;
  payment_method?: string;
  vendor?: string;
  receipt_url?: string;
  receipt_attached?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const transformBackendExpense = (expense: BackendExpense): Expense => ({
  id: expense.id,
  expenseNumber: expense.expense_number,
  category: mapCategory(expense.category),
  description: expense.description || expense.title || '',
  amount: expense.amount,
  paymentMethod: mapPaymentMethod(expense.payment_method),
  date: expense.expense_date?.split('T')[0] || '',
  vendor: expense.vendor,
  receiptAttached: expense.receipt_attached || !!expense.receipt_url,
  status: mapStatus(expense.status),
  notes: expense.notes
});

const mapCategory = (category: string): Expense['category'] => {
  const categoryMap: Record<string, Expense['category']> = {
    'rent': 'rent',
    'utilities': 'utilities',
    'transport': 'transport',
    'travel': 'transport',
    'office': 'office',
    'office_supplies': 'office',
    'marketing': 'marketing',
    'maintenance': 'maintenance',
    'other': 'other'
  };
  return categoryMap[category] || 'other';
};

const mapPaymentMethod = (method?: string): Expense['paymentMethod'] => {
  const methodMap: Record<string, Expense['paymentMethod']> = {
    'cash': 'cash',
    'bank_transfer': 'bank_transfer',
    'card': 'card',
    'credit_card': 'card',
    'debit_card': 'card'
  };
  return methodMap[method || ''] || 'cash';
};

const mapStatus = (status: string): Expense['status'] => {
  const statusMap: Record<string, Expense['status']> = {
    'pending': 'pending',
    'approved': 'approved',
    'paid': 'paid'
  };
  return statusMap[status] || 'pending';
};

const transformToBackend = (data: Partial<Expense>) => ({
  expense_number: data.expenseNumber,
  expense_date: data.date,
  description: data.description,
  category: data.category,
  amount: data.amount,
  payment_method: data.paymentMethod,
  vendor: data.vendor,
  notes: data.notes,
  status: data.status
});

export interface IExpenseGateway {
  getAll(filters?: { search?: string; category?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<ExpensesResponse>>;
  getById(id: string): Promise<ApiResponse<Expense>>;
  create(data: Omit<Expense, 'id' | 'receiptAttached'>): Promise<ApiResponse<Expense>>;
  update(id: string, data: Partial<Expense>): Promise<ApiResponse<Expense>>;
  delete(id: string): Promise<ApiResponse<void>>;
  getStats(): Promise<ApiResponse<ExpenseStats>>;
  updateStatus(id: string, status: Expense['status']): Promise<ApiResponse<Expense>>;
  approveExpense(id: string): Promise<ApiResponse<Expense>>;
  attachReceipt(id: string, receiptUrl: string): Promise<ApiResponse<Expense>>;
}

export const expenseGateway: IExpenseGateway = {
  async getAll(filters?): Promise<ApiResponse<ExpensesResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/expenses?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const expenses = Array.isArray(rawData) ? rawData.map(transformBackendExpense) : [];
        return { 
          success: true, 
          data: {
            data: expenses,
            total: result.data?.total || expenses.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch expenses' };
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch expenses' };
    }
  },

  async getById(id: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendExpense(result.data) };
      }
      return { success: false, error: result.error || 'Expense not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch expense' };
    }
  },

  async create(data): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendExpense(result.data) };
      }
      return { success: false, error: result.error || 'Failed to create expense' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create expense' };
    }
  },

  async update(id: string, data): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendExpense(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update expense' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update expense' };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete expense' };
    }
  },

  async getStats(): Promise<ApiResponse<ExpenseStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/stats`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const expenses = listResponse.data.data;
          return {
            success: true,
            data: {
              totalExpenses: expenses.length,
              pending: expenses.filter(e => e.status === 'pending').length,
              approved: expenses.filter(e => e.status === 'approved').length,
              paid: expenses.filter(e => e.status === 'paid').length,
              totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
              withReceipts: expenses.filter(e => e.receiptAttached).length
            }
          };
        }
        return { success: true, data: { totalExpenses: 0, pending: 0, approved: 0, paid: 0, totalAmount: 0, withReceipts: 0 } };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { 
          success: true, 
          data: {
            totalExpenses: result.data.total_expenses || result.data.totalExpenses || 0,
            pending: result.data.pending || 0,
            approved: result.data.approved || 0,
            paid: result.data.paid || 0,
            totalAmount: result.data.total_amount || result.data.totalAmount || 0,
            withReceipts: result.data.with_receipts || result.data.withReceipts || 0
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },

  async updateStatus(id: string, status): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendExpense(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update status' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update status' };
    }
  },

  async approveExpense(id: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendExpense(result.data) };
      }
      return { success: false, error: result.error || 'Failed to approve expense' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to approve expense' };
    }
  },

  async attachReceipt(id: string, receiptUrl: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}/attach-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_url: receiptUrl })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendExpense(result.data) };
      }
      return { success: false, error: result.error || 'Failed to attach receipt' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to attach receipt' };
    }
  }
};
