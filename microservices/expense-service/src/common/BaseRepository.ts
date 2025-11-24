import { Knex } from 'knex';
import db from '../config/database';
import { IRepository } from '../interfaces/IRepository';

export abstract class BaseRepository<T, F = any> implements IRepository<T, F> {
  constructor(protected tableName: string) {}

  protected get db(): Knex {
    return db;
  }

  protected async withTransaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>
  ): Promise<R> {
    return await this.db.transaction(callback);
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db(this.tableName).where({ id }).first();
    return result || null;
  }

  async findAll(filters: F = {} as F): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', ...otherFilters } = filters as any;

    let query = this.db(this.tableName);
    query = this.applyFilters(query, otherFilters);

    const total = await query.clone().count('* as count').first().then((row: any) => parseInt(row?.count || '0'));
    
    const data = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async count(filters: F = {} as F): Promise<number> {
    let query = this.db(this.tableName);
    query = this.applyFilters(query, filters);
    const result = await query.count('* as count').first();
    return parseInt((result as any)?.count || '0');
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const [result] = await this.db(this.tableName).insert(data).returning('*');
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db(this.tableName).where({ id }).delete();
    return deleted > 0;
  }

  protected applyFilters(query: Knex.QueryBuilder, filters: any): Knex.QueryBuilder {
    return query;
  }
}
