import { Knex } from 'knex';
import db from '../config/database';
import { IRepository } from '../interfaces/IRepository';

export abstract class BaseRepository<T> implements IRepository<T> {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(filters?: any): Promise<T[]> {
    let query = this.db(this.tableName);
    
    if (filters) {
      query = this.applyFilters(query, filters);
    }
    
    return query;
  }

  async findById(id: string): Promise<T | undefined> {
    return this.db(this.tableName).where({ id }).first();
  }

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db(this.tableName).insert(data).returning('*');
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T | undefined> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update(data)
      .returning('*');
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db(this.tableName).where({ id }).del();
    return deleted > 0;
  }

  protected applyFilters(query: Knex.QueryBuilder, filters: any): Knex.QueryBuilder {
    return query;
  }

  // Transaction support for complex operations
  protected async transaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    const trx = await this.db.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
