import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { ExpenseFiltersDto } from './dto';

@Injectable()
export class ExpenseRepository {
  private readonly table = 'expenses';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findAll(filters: ExpenseFiltersDto = {}) {
    const {
      search, category, status, vendor, dateFrom, dateTo,
      page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc',
    } = filters;

    const query = this.db(this.table);
    if (search) {
      query.where((qb) =>
        qb.whereILike('title', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereILike('expense_number', `%${search}%`)
          .orWhereILike('vendor', `%${search}%`),
      );
    }
    if (category) query.where({ category });
    if (status) query.where({ status });
    if (vendor) query.whereILike('vendor', `%${vendor}%`);
    if (dateFrom) query.where('expense_date', '>=', dateFrom);
    if (dateTo) query.where('expense_date', '<=', dateTo);

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

  async generateExpenseNumber(): Promise<string> {
    const result = await this.db(this.table).max('expense_number as max_number').first();
    if (!result?.max_number) return 'EXP-001';
    const current = parseInt(result.max_number.split('-')[1]);
    return `EXP-${String(current + 1).padStart(3, '0')}`;
  }

  async getStats(filters: ExpenseFiltersDto = {}) {
    const query = this.db(this.table);
    if (filters.category) query.where({ category: filters.category });
    if (filters.dateFrom) query.where('expense_date', '>=', filters.dateFrom);
    if (filters.dateTo) query.where('expense_date', '<=', filters.dateTo);

    const [stats] = await query.clone().select(
      this.db.raw('COUNT(*)::int AS "totalCount"'),
      this.db.raw('COALESCE(SUM(amount), 0)::numeric AS "totalAmount"'),
      this.db.raw("COUNT(*) FILTER (WHERE status = 'pending')::int AS \"pendingCount\""),
      this.db.raw("COUNT(*) FILTER (WHERE status = 'approved')::int AS \"approvedCount\""),
      this.db.raw("COUNT(*) FILTER (WHERE status = 'paid')::int AS \"paidCount\""),
      this.db.raw("COUNT(*) FILTER (WHERE receipt_attached = true)::int AS \"withReceiptsCount\""),
      this.db.raw("COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::numeric AS \"pendingAmount\""),
      this.db.raw("COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0)::numeric AS \"approvedAmount\""),
      this.db.raw("COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)::numeric AS \"paidAmount\""),
    );
    return stats;
  }

  async getByCategory(filters: ExpenseFiltersDto = {}) {
    const query = this.db(this.table);
    if (filters.dateFrom) query.where('expense_date', '>=', filters.dateFrom);
    if (filters.dateTo) query.where('expense_date', '<=', filters.dateTo);

    return query
      .select('category')
      .sum('amount as total_amount')
      .count('* as count')
      .groupBy('category')
      .orderBy('total_amount', 'desc');
  }
}
