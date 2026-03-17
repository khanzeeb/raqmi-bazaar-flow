import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { PurchaseFiltersDto } from './dto';

/** Single table gateway — all Knex queries live here (SRP). */
@Injectable()
export class PurchaseRepository {
  private readonly table = 'purchases';
  private readonly itemsTable = 'purchase_items';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  // ─── CRUD ───

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findAll(filters: PurchaseFiltersDto = {}) {
    const {
      status, paymentStatus, supplierId, startDate, endDate,
      page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc',
    } = filters;

    const query = this.db(this.table);

    if (status) query.where({ status });
    if (paymentStatus) query.where('payment_status', paymentStatus);
    if (supplierId) query.where('supplier_id', supplierId);
    if (startDate) query.where('purchase_date', '>=', startDate);
    if (endDate) query.where('purchase_date', '<=', endDate);

    const total = await query.clone().count('* as c').first().then((r: any) => +r.c);
    const data = await query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: Record<string, any>) {
    const [row] = await this.db(this.table).insert(data).returning('*');
    return row;
  }

  async update(id: string, data: Record<string, any>) {
    const [row] = await this.db(this.table)
      .where({ id })
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return row ?? null;
  }

  async delete(id: string) {
    return (await this.db(this.table).where({ id }).delete()) > 0;
  }

  // ─── Items ───

  async findItemsByPurchaseId(purchaseId: string) {
    return this.db(this.itemsTable).where({ purchase_id: purchaseId });
  }

  async replaceItems(purchaseId: string, items: Record<string, any>[], trx?: Knex.Transaction) {
    const q = trx || this.db;
    await q(this.itemsTable).where({ purchase_id: purchaseId }).del();
    if (items.length > 0) {
      await q(this.itemsTable).insert(items);
    }
  }

  // ─── Domain queries ───

  async generatePurchaseNumber(): Promise<string> {
    const last = await this.db(this.table).orderBy('created_at', 'desc').first();
    if (!last) return 'PO-0001';
    const num = parseInt(last.purchase_number.split('-')[1]) + 1;
    return `PO-${num.toString().padStart(4, '0')}`;
  }

  async getStats(filters?: { startDate?: string; endDate?: string }) {
    const query = this.db(this.table);
    if (filters?.startDate) query.where('purchase_date', '>=', filters.startDate);
    if (filters?.endDate) query.where('purchase_date', '<=', filters.endDate);

    const [stats] = await query.select(
      this.db.raw('COUNT(*)::int AS "totalPurchases"'),
      this.db.raw('COALESCE(SUM(total_amount), 0)::numeric AS "totalAmount"'),
      this.db.raw('COALESCE(SUM(paid_amount), 0)::numeric AS "paidAmount"'),
      this.db.raw('COUNT(*) FILTER (WHERE status = ?) AS "pendingCount"', ['pending']),
      this.db.raw('COUNT(*) FILTER (WHERE status = ?) AS "receivedCount"', ['received']),
      this.db.raw('COUNT(*) FILTER (WHERE payment_status = ?) AS "unpaidCount"', ['pending']),
    );

    return {
      ...stats,
      pendingAmount: Number(stats.totalAmount) - Number(stats.paidAmount),
    };
  }

  // ─── Transaction helper ───

  async withinTransaction<R>(cb: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(cb);
  }
}
