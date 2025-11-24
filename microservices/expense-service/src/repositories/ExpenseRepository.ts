import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { Expense, ExpenseFilters } from '../models/Expense';
import { IExpenseRepository } from '../interfaces/IRepository';

export class ExpenseRepository extends BaseRepository<Expense, ExpenseFilters> implements IExpenseRepository {
  constructor() {
    super('expenses');
  }

  protected applyFilters(query: Knex.QueryBuilder, filters: ExpenseFilters): Knex.QueryBuilder {
    if (filters.category) {
      query = query.where('category', filters.category);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.vendor) {
      query = query.where('vendor', 'ilike', `%${filters.vendor}%`);
    }

    if (filters.date_from) {
      query = query.where('expense_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('expense_date', '<=', filters.date_to);
    }

    if (filters.search) {
      query = query.where((builder) => {
        builder
          .where('title', 'ilike', `%${filters.search}%`)
          .orWhere('description', 'ilike', `%${filters.search}%`)
          .orWhere('expense_number', 'ilike', `%${filters.search}%`)
          .orWhere('vendor', 'ilike', `%${filters.search}%`);
      });
    }

    return query;
  }

  async updateStatus(id: string, status: string): Promise<Expense | null> {
    return await this.update(id, { status } as Partial<Expense>);
  }

  async attachReceipt(id: string, receiptUrl: string): Promise<Expense | null> {
    return await this.update(id, { 
      receipt_url: receiptUrl,
      receipt_attached: true 
    } as Partial<Expense>);
  }

  async getStats(filters: ExpenseFilters = {}): Promise<any> {
    let query = this.db(this.tableName);
    query = this.applyFilters(query, filters);

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_count'),
        this.db.raw('SUM(amount) as total_amount'),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as pending_count', ['pending']),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as approved_count', ['approved']),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as paid_count', ['paid']),
        this.db.raw('COUNT(CASE WHEN receipt_attached = true THEN 1 END) as with_receipts_count'),
        this.db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as pending_amount', ['pending']),
        this.db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as approved_amount', ['approved']),
        this.db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as paid_amount', ['paid'])
      )
      .first();

    return {
      total_count: parseInt(stats.total_count || '0'),
      total_amount: parseFloat(stats.total_amount || '0'),
      pending_count: parseInt(stats.pending_count || '0'),
      approved_count: parseInt(stats.approved_count || '0'),
      paid_count: parseInt(stats.paid_count || '0'),
      with_receipts_count: parseInt(stats.with_receipts_count || '0'),
      pending_amount: parseFloat(stats.pending_amount || '0'),
      approved_amount: parseFloat(stats.approved_amount || '0'),
      paid_amount: parseFloat(stats.paid_amount || '0')
    };
  }

  async getByCategory(filters: ExpenseFilters = {}): Promise<any[]> {
    let query = this.db(this.tableName);
    query = this.applyFilters(query, filters);

    const results = await query
      .select('category')
      .sum('amount as total_amount')
      .count('* as count')
      .groupBy('category')
      .orderBy('total_amount', 'desc');

    return results.map((row: any) => ({
      category: row.category,
      total_amount: parseFloat(row.total_amount || '0'),
      count: parseInt(row.count || '0')
    }));
  }

  async generateExpenseNumber(): Promise<string> {
    const result = await this.db(this.tableName)
      .max('expense_number as max_number')
      .first();

    if (!result?.max_number) {
      return 'EXP-001';
    }

    const currentNumber = parseInt(result.max_number.split('-')[1]);
    const nextNumber = currentNumber + 1;
    return `EXP-${String(nextNumber).padStart(3, '0')}`;
  }
}
