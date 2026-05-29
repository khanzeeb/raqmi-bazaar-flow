import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { PaymentFiltersDto } from './dto';

/** Single table gateway — all Knex queries live here (SRP). */
@Injectable()
export class PaymentRepository {
  private readonly table = 'payments';
  private readonly allocationsTable = 'payment_allocations';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  // ─── Payment CRUD ───

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findByPaymentNumber(paymentNumber: string) {
    return this.db(this.table).where({ payment_number: paymentNumber }).first();
  }

  async findByCustomerId(customerId: string) {
    return this.db(this.table)
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc');
  }

  async findAll(filters: PaymentFiltersDto = {}) {
    const {
      search, status, paymentMethod, customerId, startDate, endDate,
      page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc',
    } = filters;

    const query = this.db(this.table);

    if (search) {
      query.where((qb) => {
        qb.whereILike('payment_number', `%${search}%`)
          .orWhereILike('customer_name', `%${search}%`)
          .orWhereILike('reference', `%${search}%`);
      });
    }
    if (status) query.where({ status });
    if (paymentMethod) query.where({ payment_method: paymentMethod });
    if (customerId) query.where({ customer_id: customerId });
    if (startDate) query.where('payment_date', '>=', startDate);
    if (endDate) query.where('payment_date', '<=', endDate);

    const sortColumn = this.mapToSnakeCase(sortBy);
    const total = await query.clone().count('* as c').first().then((r: any) => +r.c);
    const data = await query
      .orderBy(sortColumn, sortOrder)
      .limit(limit)
      .offset((page - 1) * limit);

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

  // ─── Numbering ───

  async generatePaymentNumber(): Promise<string> {
    const now = new Date();
    const prefix = `PAY-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const last = await this.db(this.table)
      .where('payment_number', 'like', `${prefix}%`)
      .orderBy('payment_number', 'desc')
      .first();

    let seq = 1;
    if (last) {
      const lastSeq = parseInt(String(last.payment_number).split('-').pop() || '0');
      seq = lastSeq + 1;
    }
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  // ─── Stats ───

  async getStats(startDate?: string, endDate?: string) {
    const query = this.db(this.table);
    if (startDate) query.where('payment_date', '>=', startDate);
    if (endDate) query.where('payment_date', '<=', endDate);

    const [stats] = await query.select(
      this.db.raw('COUNT(*)::int AS "totalPayments"'),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingPayments"`),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'completed')::int AS "completedPayments"`),
      this.db.raw(`COUNT(*) FILTER (WHERE status = 'cancelled')::int AS "cancelledPayments"`),
      this.db.raw(`COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)::numeric AS "totalAmount"`),
      this.db.raw(`COALESCE(SUM(unallocated_amount) FILTER (WHERE status = 'completed'), 0)::numeric AS "unallocatedAmount"`),
    );
    return stats;
  }

  // ─── Allocations ───

  async findAllocationsByPaymentId(paymentId: string) {
    return this.db(this.allocationsTable)
      .where({ payment_id: paymentId })
      .orderBy('allocated_at', 'asc');
  }

  async createAllocation(data: Record<string, any>, trx?: Knex.Transaction) {
    const q = trx ? trx(this.allocationsTable) : this.db(this.allocationsTable);
    const [row] = await q.insert(data).returning('*');
    return row;
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
      paymentDate: 'payment_date',
      paymentNumber: 'payment_number',
      customerName: 'customer_name',
      amount: 'amount',
      status: 'status',
    };
    return map[camelCase] || camelCase;
  }
}
