import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { PricingFiltersDto, PricingRuleStatus } from './dto';

@Injectable()
export class PricingRepository {
  private readonly table = 'pricing_rules';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findAll(filters: PricingFiltersDto = {}) {
    const {
      search, type, status, productId, categoryId,
      page = 1, limit = 20, sortBy = 'priority', sortOrder = 'desc',
    } = filters;

    const query = this.db(this.table);
    if (search) query.where((qb) => qb.whereILike('name', `%${search}%`).orWhereILike('description', `%${search}%`));
    if (type) query.where({ type });
    if (status) query.where({ status });
    if (productId) query.where({ product_id: productId });
    if (categoryId) query.where({ category_id: categoryId });

    const total = await query.clone().count('* as c').first().then((r: any) => +r.c);
    const data = await query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findActiveForProduct(productId: string, quantity: number) {
    const now = new Date();
    return this.db(this.table)
      .where({ status: PricingRuleStatus.ACTIVE })
      .where((qb) => qb.where({ product_id: productId }).orWhereNull('product_id'))
      .where((qb) => qb.where('start_date', '<=', now).orWhereNull('start_date'))
      .where((qb) => qb.where('end_date', '>=', now).orWhereNull('end_date'))
      .where((qb) => qb.where('min_quantity', '<=', quantity).orWhereNull('min_quantity'))
      .orderBy('priority', 'desc');
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

  async getStats() {
    const [stats] = await this.db(this.table).select(
      this.db.raw('COUNT(*)::int AS "totalRules"'),
      this.db.raw(`COUNT(*) FILTER (WHERE status = '${PricingRuleStatus.ACTIVE}')::int AS "activeRules"`),
      this.db.raw(`COUNT(DISTINCT product_id) FILTER (WHERE product_id IS NOT NULL)::int AS "productsWithRules"`),
    );
    return stats;
  }
}
