import { Expense } from '../models/Expense';

interface ExpenseData {
  description: string;
  amount: number;
  category: string;
  date: Date;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
  receipt_url?: string;
  vendor_name?: string;
  reference_number?: string;
  notes?: string;
  user_id: string;
}

interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
  vendor_name?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ExpenseService {
  
  static async createExpense(expenseData: ExpenseData) {
    try {
      // Set default status if not provided
      if (!expenseData.status) {
        expenseData.status = 'pending';
      }
      
      const expense = await Expense.create(expenseData);
      return expense;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async getExpenseById(expenseId: string) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    return expense;
  }
  
  static async getExpenses(filters: ExpenseFilters = {}) {
    return await Expense.findAll(filters);
  }
  
  static async updateExpense(expenseId: string, expenseData: Partial<ExpenseData>) {
    try {
      const existingExpense = await Expense.findById(expenseId);
      if (!existingExpense) {
        throw new Error('Expense not found');
      }
      
      // Prevent modification of paid expenses
      if (existingExpense.status === 'paid') {
        throw new Error('Cannot modify paid expenses');
      }
      
      const expense = await Expense.update(expenseId, expenseData);
      return expense;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async deleteExpense(expenseId: string) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Prevent deletion of paid expenses
    if (expense.status === 'paid') {
      throw new Error('Cannot delete paid expenses');
    }
    
    return await Expense.delete(expenseId);
  }
  
  static async updateExpenseStatus(expenseId: string, status: 'pending' | 'approved' | 'paid' | 'rejected') {
    try {
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        'pending': ['approved', 'rejected'],
        'approved': ['paid', 'rejected'],
        'rejected': ['pending'],
        'paid': [] // Cannot change from paid
      };
      
      if (!validTransitions[expense.status].includes(status)) {
        throw new Error(`Cannot change status from ${expense.status} to ${status}`);
      }
      
      const updatedExpense = await Expense.update(expenseId, { status });
      return updatedExpense;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async approveExpense(expenseId: string) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    if (expense.status !== 'pending') {
      throw new Error('Only pending expenses can be approved');
    }
    
    return await this.updateExpenseStatus(expenseId, 'approved');
  }
  
  static async attachReceipt(expenseId: string, receiptUrl: string) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    return await Expense.update(expenseId, { receipt_url: receiptUrl });
  }
  
  static async getExpenseStats(filters: ExpenseFilters = {}) {
    return await Expense.getExpenseStats(filters);
  }
  
  static async getExpensesByCategory(filters: ExpenseFilters = {}) {
    return await Expense.getExpensesByCategory(filters);
  }
  
  static async generateExpenseReport(filters: ExpenseFilters = {}) {
    try {
      const [expenses, stats, categoryBreakdown] = await Promise.all([
        this.getExpenses(filters),
        this.getExpenseStats(filters),
        this.getExpensesByCategory(filters)
      ]);
      
      return {
        expenses,
        stats,
        categoryBreakdown,
        generatedAt: new Date(),
        filters
      };
      
    } catch (error) {
      throw error;
    }
  }
}