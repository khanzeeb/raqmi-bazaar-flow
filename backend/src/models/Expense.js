const db = require('../config/database');

class Expense {
  static get tableName() {
    return 'expenses';
  }

  static async findById(id) {
    return await db(this.tableName)
      .where('id', id)
      .first();
  }

  static async findByExpenseNumber(expenseNumber) {
    return await db(this.tableName)
      .where('expense_number', expenseNumber)
      .first();
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName).select('*');
    
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.date_from) {
      query = query.where('expense_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('expense_date', '<=', filters.date_to);
    }
    
    if (filters.vendor) {
      query = query.where('vendor', 'ilike', `%${filters.vendor}%`);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('expense_number', 'ilike', `%${filters.search}%`)
            .orWhere('title', 'ilike', `%${filters.search}%`)
            .orWhere('vendor', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const expenses = await query
      .orderBy(filters.sortBy || 'created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: expenses,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName).count('id as count');
    
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.date_from) {
      query = query.where('expense_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('expense_date', '<=', filters.date_to);
    }
    
    if (filters.vendor) {
      query = query.where('vendor', 'ilike', `%${filters.vendor}%`);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('expense_number', 'ilike', `%${filters.search}%`)
            .orWhere('title', 'ilike', `%${filters.search}%`)
            .orWhere('vendor', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(expenseData) {
    // Generate expense number if not provided
    if (!expenseData.expense_number) {
      expenseData.expense_number = await this.generateExpenseNumber();
    }
    
    const [expense] = await db(this.tableName)
      .insert({
        ...expenseData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return expense;
  }

  static async update(id, expenseData) {
    const [expense] = await db(this.tableName)
      .where({ id })
      .update({
        ...expenseData,
        updated_at: new Date()
      })
      .returning('*');
    
    return expense;
  }

  static async delete(id) {
    return await db(this.tableName).where({ id }).del();
  }

  static async generateExpenseNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `EXP-${year}${month}`;
    
    const lastExpense = await db(this.tableName)
      .where('expense_number', 'like', `${prefix}%`)
      .orderBy('expense_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastExpense) {
      const lastSequence = parseInt(lastExpense.expense_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async getExpenseStats(filters = {}) {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('expense_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('expense_date', '<=', filters.date_to);
    }
    
    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) as total_expenses'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as pending_count', ['pending']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as approved_count', ['approved']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as paid_count', ['paid']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as cancelled_count', ['cancelled']),
        db.raw('COUNT(CASE WHEN receipt_attached = true THEN 1 END) as receipts_count'),
        db.raw('AVG(amount) as average_expense_amount')
      )
      .first();
    
    return stats;
  }

  static async getExpensesByCategory(filters = {}) {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('expense_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('expense_date', '<=', filters.date_to);
    }
    
    return await baseQuery
      .select('category')
      .sum('amount as total_amount')
      .count('id as count')
      .groupBy('category')
      .orderBy('total_amount', 'desc');
  }
}

module.exports = Expense;