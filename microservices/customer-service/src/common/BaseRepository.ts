import { Knex } from 'knex';
import db from '../config/database';

export abstract class BaseRepository<T, F = any> {
  protected abstract tableName: string;

  protected get db(): Knex {
    return db;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db(this.tableName).where({ id }).first();
    return result || null;
  }

  async findAll(filters: F & { page?: number; limit?: number } = {} as F): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.buildFindAllQuery(filters);
    const limit = (filters as any).limit || 10;
    const offset = (((filters as any).page || 1) - 1) * limit;
    
    const data = await query
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data,
      total,
      page: (filters as any).page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async count(filters: F = {} as F): Promise<number> {
    const query = this.buildCountQuery(filters);
    const result = await query.first();
    return parseInt(result.count as string);
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const [result] = await this.db(this.tableName)
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db(this.tableName).where({ id }).del();
    return result > 0;
  }

  protected abstract buildFindAllQuery(filters: F): Knex.QueryBuilder;
  protected abstract buildCountQuery(filters: F): Knex.QueryBuilder;

  protected applySearchFilter(query: Knex.QueryBuilder, search: string, fields: string[]): void {
    if (search) {
      query.where(function(this: Knex.QueryBuilder) {
        fields.forEach((field, index) => {
          const method = index === 0 ? 'where' : 'orWhere';
          this[method](field, 'ilike', `%${search}%`);
        });
      });
    }
  }

  protected applySorting(query: Knex.QueryBuilder, sortBy = 'created_at', sortOrder: 'asc' | 'desc' = 'desc'): void {
    query.orderBy(sortBy, sortOrder);
  }
}