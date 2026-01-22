// Base Repository - DRY: Common Knex operations
import db from '../config/database';
import { Knex } from 'knex';

export interface IBaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository {
  protected db = db;

  /**
   * Execute callback within a transaction
   */
  protected async withTransaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>
  ): Promise<R> {
    return this.db.transaction(callback);
  }

  /**
   * Set timestamps for create operations
   */
  protected setTimestamps(data: any, isUpdate = false): any {
    const now = new Date();
    if (isUpdate) {
      return { ...data, updated_at: now };
    }
    return { ...data, created_at: now, updated_at: now };
  }
}

export default BaseRepository;
