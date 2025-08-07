const Expense = require('../models/Expense');

class ExpenseService {
  
  static async createExpense(expenseData) {
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
  
  static async updateExpense(expenseId, expenseData) {
    try {
      const existingExpense = await Expense.findById(expenseId);
      if (!existingExpense) {
        throw new Error('Expense not found');
      }
      
      // Check if expense can be modified
      if (existingExpense.status === 'paid') {
        throw new Error('Cannot modify paid expense');
      }
      
      const expense = await Expense.update(expenseId, expenseData);
      return expense;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async getExpenseById(expenseId) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    return expense;
  }
  
  static async getExpenses(filters = {}) {
    return await Expense.findAll(filters);
  }
  
  static async deleteExpense(expenseId) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Check if expense can be deleted
    if (expense.status === 'paid') {
      throw new Error('Cannot delete paid expense');
    }
    
    return await Expense.delete(expenseId);
  }
  
  static async updateExpenseStatus(expenseId, status) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Validate status transitions
    const validTransitions = {
      'pending': ['approved', 'cancelled'],
      'approved': ['paid', 'cancelled'],
      'paid': [],
      'cancelled': []
    };
    
    if (!validTransitions[expense.status].includes(status)) {
      throw new Error(`Cannot change status from ${expense.status} to ${status}`);
    }
    
    return await Expense.update(expenseId, { status });
  }
  
  static async approveExpense(expenseId) {
    const expense = await this.getExpenseById(expenseId);
    
    if (expense.status !== 'pending') {
      throw new Error('Only pending expenses can be approved');
    }
    
    return await this.updateExpenseStatus(expenseId, 'approved');
  }
  
  static async attachReceipt(expenseId, receiptUrl) {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    return await Expense.update(expenseId, {
      receipt_url: receiptUrl,
      receipt_attached: true
    });
  }
  
  static async getExpenseStats(filters = {}) {
    return await Expense.getExpenseStats(filters);
  }
  
  static async getExpensesByCategory(filters = {}) {
    return await Expense.getExpensesByCategory(filters);
  }
  
  static async generateExpenseReport(filters = {}) {
    const expenses = await Expense.findAll({ ...filters, limit: 1000 });
    const stats = await Expense.getExpenseStats(filters);
    const categoryBreakdown = await Expense.getExpensesByCategory(filters);
    
    return {
      expenses: expenses.data,
      statistics: stats,
      category_breakdown: categoryBreakdown,
      summary: {
        total_expenses: expenses.total,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        }
      }
    };
  }
}

module.exports = ExpenseService;