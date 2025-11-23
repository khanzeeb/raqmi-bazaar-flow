import { BaseRepository } from '../common/BaseRepository';
import { PurchaseData, PurchaseFilter } from '../models/Purchase';
import { Knex } from 'knex';

export class PurchaseRepository extends BaseRepository<PurchaseData> {
  constructor() {
    super('purchases');
  }

  async generatePurchaseNumber(): Promise<string> {
    const lastPurchase = await this.db(this.tableName)
      .orderBy('created_at', 'desc')
      .first();

    if (!lastPurchase) {
      return 'PO-0001';
    }

    const lastNumber = parseInt(lastPurchase.purchase_number.split('-')[1]);
    const newNumber = lastNumber + 1;
    return `PO-${newNumber.toString().padStart(4, '0')}`;
  }

  protected applyFilters(query: Knex.QueryBuilder, filters: PurchaseFilter): Knex.QueryBuilder {
    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.payment_status) {
      query = query.where('payment_status', filters.payment_status);
    }

    if (filters.supplier_id) {
      query = query.where('supplier_id', filters.supplier_id);
    }

    if (filters.start_date) {
      query = query.where('purchase_date', '>=', filters.start_date);
    }

    if (filters.end_date) {
      query = query.where('purchase_date', '<=', filters.end_date);
    }

    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.limit(filters.limit).offset(offset);
    }

    return query;
  }

  async getStats(filters?: { start_date?: string; end_date?: string }): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.start_date) {
      query = query.where('purchase_date', '>=', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.where('purchase_date', '<=', filters.end_date);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_purchases'),
        this.db.raw('SUM(total_amount) as total_amount'),
        this.db.raw('SUM(paid_amount) as paid_amount'),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as pending_count', ['pending']),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as received_count', ['received']),
        this.db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as unpaid_count', ['pending'])
      )
      .first();

    return {
      total_purchases: parseInt(stats.total_purchases) || 0,
      total_amount: parseFloat(stats.total_amount) || 0,
      paid_amount: parseFloat(stats.paid_amount) || 0,
      pending_amount: parseFloat(stats.total_amount) - parseFloat(stats.paid_amount) || 0,
      pending_count: parseInt(stats.pending_count) || 0,
      received_count: parseInt(stats.received_count) || 0,
      unpaid_count: parseInt(stats.unpaid_count) || 0,
    };
  }
}
