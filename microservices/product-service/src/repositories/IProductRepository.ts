// Product Repository Interface - Single Responsibility: Product data access contract

import type { IProductData } from '../data/IProductData';
import type { IProductFilters } from '../filters/IProductFilters';
import type { IPaginatedResponse } from './BaseRepository';

export interface IProductRepository {
  findById(id: string): Promise<IProductData | null>;
  findAll(filters?: IProductFilters, page?: number, limit?: number): Promise<IPaginatedResponse<IProductData>>;
  findByIds(ids: string[]): Promise<IProductData[]>;
  create(data: any): Promise<IProductData>;
  createWithVariants(productData: any, variants?: any[]): Promise<IProductData>;
  update(id: string, data: any): Promise<IProductData | null>;
  updateWithVariants(id: string, productData: any, variants?: any[]): Promise<IProductData | null>;
  updateStock(id: string, newStock: number, reason?: string): Promise<IProductData | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: IProductFilters): Promise<number>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
}
