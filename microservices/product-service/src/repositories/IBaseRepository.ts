// Base Repository Interface - DRY: Common repository contract

import { IPaginatedResponse } from '../filters';

export interface IBaseRepository<T, F> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: F, page?: number, limit?: number): Promise<{ data: T[]; total: number }>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: F): Promise<number>;
}
