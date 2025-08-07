import { BaseApiService } from './base.service';
import { ApiResponse, QueryParams, PaginatedResponse } from '@/types/api';

export interface Expense {
  id: string;
  expense_number: string;
  expense_date: string;
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
  created_at: string;
  updated_at: string;
}

class ExpenseApiService extends BaseApiService {
  async getExpenses(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Expense>>> {
    return this.get<PaginatedResponse<Expense>>('/expenses', params);
  }

  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    return this.get<Expense>(`/expenses/${id}`);
  }

  async createExpense(data: Partial<Expense>): Promise<ApiResponse<Expense>> {
    return this.post<Expense>('/expenses', data);
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<ApiResponse<Expense>> {
    return this.put<Expense>(`/expenses/${id}`, data);
  }

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/expenses/${id}`);
  }

  async getExpenseStats(params?: QueryParams): Promise<ApiResponse<any>> {
    return this.get<any>('/expenses/stats', params);
  }

  async updateStatus(id: string, status: Expense['status']): Promise<ApiResponse<Expense>> {
    return this.patch<Expense>(`/expenses/${id}/status`, { status });
  }

  async approveExpense(id: string): Promise<ApiResponse<Expense>> {
    return this.post<Expense>(`/expenses/${id}/approve`);
  }

  async attachReceipt(id: string, receiptUrl: string): Promise<ApiResponse<Expense>> {
    return this.post<Expense>(`/expenses/${id}/attach-receipt`, { receipt_url: receiptUrl });
  }
}

export const expenseApiService = new ExpenseApiService();