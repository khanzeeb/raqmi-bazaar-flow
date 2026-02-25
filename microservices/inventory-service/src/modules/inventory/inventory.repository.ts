import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { InventoryFiltersDto, StockStatus } from './dto';

/** Single table gateway — all Knex queries live here (SRP). */
@Injectable()
export class InventoryRepository {
  private readonly table = 'inventory_items';
  private readonly movementsTable = 'stock_movements';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  // ─── CRUD ───

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findByProductId(productId: string) {
    return this.db(this.table).where({ product_id: productId }).first();
  }

  async findAll(filters: InventoryFiltersDto = {}) {
    const {
      search, category, status, location, supplier,
      page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc',
    } = filters;

    const query = this.db(this.table);

    if (search) {
      query.where((qb) =>
        qb.whereILike('product_name', `%${search}%`)
          .orWhereILike('sku', `%${search}%`),
      );
    }
    if (category) query.where({ category });
    if (status) query.where({ status });
    if (location) query.where({ location });
    if (supplier) query.where({ supplier });

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

  // ─── Domain queries ───

  async findLowStock(threshold?: number) {
    const q = this.db(this.table).whereRaw('current_stock <= minimum_stock');
    if (threshold !== undefined) q.where('current_stock', '<=', threshold);
    return q;
  }

  async getStats(filters?: { category?: string; location?: string }) {
    const q = this.db(this.table);
    if (filters?.category) q.where({ category: filters.category });
    if (filters?.location) q.where({ location: filters.location });

    const [stats] = await q.clone().select(
      this.db.raw('COUNT(*)::int AS "totalItems"'),
      this.db.raw('COALESCE(SUM(current_stock * unit_cost), 0)::numeric AS "totalValue"'),
      this.db.raw('COUNT(*) FILTER (WHERE status = ?) AS "lowStockItems"', [StockStatus.LOW_STOCK]),
      this.db.raw('COUNT(*) FILTER (WHERE status = ?) AS "outOfStockItems"', [StockStatus.OUT_OF_STOCK]),
    );
    return stats;
  }

  // ─── Stock movements ───

  async createMovement(data: Record<string, any>) {
    const [row] = await this.db(this.movementsTable).insert(data).returning('*');
    return row;
  }

  async getMovements(productId: string, limit = 50) {
    return this.db(this.movementsTable)
      .where({ product_id: productId })
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  // ─── Transaction helper ───

  async withinTransaction<R>(cb: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(cb);
  }
}
