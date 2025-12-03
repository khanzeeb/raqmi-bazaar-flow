// Repository interfaces - Single Responsibility: Contract definitions

import { IPaginatedResponse } from './IProduct';

export interface IRepository<T, TFilters> {
  findById(id: string): Promise<T | null>;
  findAll(filters: TFilters): Promise<IPaginatedResponse<T>>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters: TFilters): Promise<number>;
}

export interface IProductRepository<T, TFilters> extends IRepository<T, TFilters> {
  findByIds(ids: string[]): Promise<T[]>;
  createWithVariants(productData: any, variants?: any[]): Promise<T>;
  updateWithVariants(id: string, productData: any, variants?: any[]): Promise<T | null>;
  updateStock(id: string, newStock: number, reason?: string): Promise<T | null>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
}
