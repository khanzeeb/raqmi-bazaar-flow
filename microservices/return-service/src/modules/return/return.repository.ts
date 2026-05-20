import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { ReturnFiltersDto } from './dto';

/** Single table gateway — all Knex queries live here (SRP). */
@Injectable()
export class ReturnRepository {
  private readonly table = 'returns';
  private readonly itemsTable = 'return_items';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  // ─── Return CRUD ───

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findByReturnNumber(returnNumber: string) {
    return this.db(this.table).where({ return_number: returnNumber }).first();
  }

  async findBySaleId(saleId: string) {
    return this.db(this.table).where({ sale_id: saleId }).orderBy('created_at', 'desc');
  }

  async findByCustomerId(customerId: string) {
    return this.db(this.table).where({ customer_id: customerId }).orderBy('created_at', 'desc');
  }

  async findAll(filters: ReturnFiltersDto = {}) {
    const {
      search, status, returnType, customerId, saleId, dateFrom, dateTo,
      page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc',
    } = filters;

    const query = this.db(this.table);

    if (search) query.whereILike('return_number', `%${search}%`);
    if (status) query.where({ status });
    if (returnType) query.where({ return_type: returnType });
    if (customerId) query.where({ customer_id: customerId });
    if (saleId) query.where({ sale_id: saleId });
    if (dateFrom) query.where('return_date', '>=', dateFrom);
    if (dateTo) query.where('return_date', '<=', dateTo);

    const sortColumn = this.mapToSnakeCase(sortBy);
    const total = await query.clone().count('* as c').first().then((r: any) => +r.c);
    const data = await query.orderBy(sortColumn, sortOrder).limit(limit).offset((page - 1) * limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: Record<string, any>, trx?: Knex.Transaction) {
    const q = trx ? trx(this.table) : this.db(this.table);
    const [row] = await q.insert(data).returning('*');
    return row;
  }

  async update(id: string, data: Record<string, any>, trx?: Knex.Transaction) {
    const q = trx ? trx(this.table) : this.db(this.table);
    const [row] = await q
      .where({ id })
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return row ?? null;
  }

  async delete(id: string) {
    return (await this.db(this.table).where({ id }).delete()) > 0;
  }

  // ─── Return Numbering ───

  async generateReturnNumber(): Promise<string> {
    const now = new Date();
    const prefix = `RET-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const last = await this.db(this.table)
      .where('return_number', 'like', `${prefix}%`)
      .orderBy('return_number', 'desc')
      .first();

    let seq = 1;
    if (last) {
      const lastSeq = parseInt(String(last.return_number).split('-').pop() || '0');
      seq = lastSeq + 1;
    }
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  // ─── Stats ───

  async getStats(dateFrom?: string, dateTo?: string) {
    const query = this.db(this.table);
    if (dateFrom) query.where('return_date', '>=', dateFrom);
    if (dateTo) query.where('return_date', '<=', dateTo);

    const [stats] = await query.select(
      this.db.raw('COUNT(*)::int AS "totalReturns"'),
      this.db.raw('COALESCE(SUM(total_amount), 0)::numeric AS "totalAmount"'),
      this.db.raw('COALESCE(SUM(refund_amount), 0)::numeric AS "totalRefunded"'),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingCount"`),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'approved')::int AS "approvedCount"`),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'rejected')::int AS "rejectedCount"`),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'completed')::int AS "completedCount"`),
      this.db.raw(`COUNT(*) FILTER (WHERE return_type = 'full')::int AS "fullReturnsCount"`),
      this.db.raw(`COUNT(*) FILTER (WHERE return_type = 'partial')::int AS "partialReturnsCount"`),
    );
    return stats;
  }

  // ─── Return Items ───

  async findItemsByReturnId(returnId: string) {
    return this.db(this.itemsTable).where({ return_id: returnId }).orderBy('created_at', 'asc');
  }

  async createItems(items: Record<string, any>[], trx?: Knex.Transaction) {
    if (!items.length) return [];
    const q = trx ? trx(this.itemsTable) : this.db(this.itemsTable);
    return q.insert(items).returning('*');
  }

  async deleteItemsByReturnId(returnId: string, trx?: Knex.Transaction) {
    const q = trx ? trx(this.itemsTable) : this.db(this.itemsTable);
    return q.where({ return_id: returnId }).delete();
  }

  async getSaleItemReturnedQty(saleItemId: string): Promise<number> {
    const result = await this.db(this.itemsTable)
      .where({ sale_item_id: saleItemId })
      .sum('quantity_returned as total')
      .first();
    return parseInt(String(result?.total || 0));
  }

  // ─── Transaction helper ───

  async withinTransaction<R>(cb: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(cb);
  }

  // ─── Column mapping ───

  private mapToSnakeCase(camelCase: string): string {
    const map: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      returnDate: 'return_date',
      returnNumber: 'return_number',
      totalAmount: 'total_amount',
      refundAmount: 'refund_amount',
    };
    return map[camelCase] || camelCase;
  }
}
