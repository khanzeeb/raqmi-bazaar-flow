import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_TOKEN } from '../../database/knex.module';
import { SupplierFiltersDto } from './dto';

/** Single table gateway — all Knex queries live here (SRP). */
@Injectable()
export class SupplierRepository {
  private readonly table = 'suppliers';
  private readonly contactsTable = 'supplier_contacts';
  private readonly ratingsTable = 'supplier_ratings';

  constructor(@Inject(KNEX_TOKEN) private readonly db: Knex) {}

  // ─── Supplier CRUD ───

  async findById(id: string) {
    return this.db(this.table).where({ id }).first();
  }

  async findByEmail(email: string) {
    return this.db(this.table).where({ email }).first();
  }

  async findByIds(ids: string[]) {
    return this.db(this.table).whereIn('id', ids);
  }

  async findAll(filters: SupplierFiltersDto = {}) {
    const {
      search, status, country,
      page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc',
    } = filters;

    const query = this.db(this.table);

    if (search) {
      query.where((qb) =>
        qb.whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('contact_person', `%${search}%`),
      );
    }
    if (status) query.where({ status });
    if (country) query.where({ country });

    const sortColumn = this.mapToSnakeCase(sortBy);
    const total = await query.clone().count('* as c').first().then((r: any) => +r.c);
    const data = await query.orderBy(sortColumn, sortOrder).limit(limit).offset((page - 1) * limit);

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

  // ─── Stats ───

  async getStats() {
    const [stats] = await this.db(this.table).select(
      this.db.raw('COUNT(*)::int AS "totalSuppliers"'),
      this.db.raw("COUNT(*) FILTER (WHERE status = 'active') AS \"activeCount\""),
      this.db.raw("COUNT(*) FILTER (WHERE status = 'inactive') AS \"inactiveCount\""),
      this.db.raw('COALESCE(SUM(credit_limit), 0)::numeric AS "totalCreditLimit"'),
    );
    return stats;
  }

  // ─── Purchases (cross-service query) ───

  async getPurchaseCount(supplierId: string): Promise<number> {
    try {
      const result = await this.db('purchases')
        .where({ supplier_id: supplierId })
        .count('id as count')
        .first();
      return parseInt(result?.count as string) || 0;
    } catch {
      return 0; // purchases table may not exist in this service's DB
    }
  }

  // ─── Contacts ───

  async findContactById(id: string) {
    return this.db(this.contactsTable).where({ id }).first();
  }

  async findContactsBySupplierId(supplierId: string) {
    return this.db(this.contactsTable)
      .where({ supplier_id: supplierId })
      .orderBy('is_primary', 'desc')
      .orderBy('name', 'asc');
  }

  async createContact(data: Record<string, any>) {
    const [row] = await this.db(this.contactsTable).insert(data).returning('*');
    return row;
  }

  async updateContact(id: string, data: Record<string, any>) {
    const [row] = await this.db(this.contactsTable)
      .where({ id })
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return row ?? null;
  }

  async deleteContact(id: string) {
    return (await this.db(this.contactsTable).where({ id }).delete()) > 0;
  }

  async resetPrimaryContacts(supplierId: string, excludeId?: string) {
    const q = this.db(this.contactsTable)
      .where({ supplier_id: supplierId })
      .update({ is_primary: false });
    if (excludeId) q.whereNot({ id: excludeId });
    return q;
  }

  // ─── Ratings ───

  async findRatingsBySupplierId(supplierId: string, limit = 50) {
    return this.db(this.ratingsTable)
      .where({ supplier_id: supplierId })
      .orderBy('rated_at', 'desc')
      .limit(limit);
  }

  async createRating(data: Record<string, any>) {
    const [row] = await this.db(this.ratingsTable).insert(data).returning('*');
    return row;
  }

  async getAverageRating(supplierId: string) {
    const [result] = await this.db(this.ratingsTable)
      .where({ supplier_id: supplierId })
      .select(
        this.db.raw('ROUND(AVG(quality_score), 1)::numeric AS "avgQuality"'),
        this.db.raw('ROUND(AVG(delivery_score), 1)::numeric AS "avgDelivery"'),
        this.db.raw('ROUND(AVG(pricing_score), 1)::numeric AS "avgPricing"'),
        this.db.raw('ROUND(AVG(overall_score), 1)::numeric AS "avgOverall"'),
        this.db.raw('COUNT(*)::int AS "totalRatings"'),
      );
    return result;
  }

  // ─── Transaction helper ───

  async withinTransaction<R>(cb: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(cb);
  }

  // ─── Column mapping ───

  private mapToSnakeCase(camelCase: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      creditLimit: 'credit_limit',
      contactPerson: 'contact_person',
      postalCode: 'postal_code',
      taxId: 'tax_id',
      paymentTerms: 'payment_terms',
    };
    return mapping[camelCase] || camelCase;
  }
}
