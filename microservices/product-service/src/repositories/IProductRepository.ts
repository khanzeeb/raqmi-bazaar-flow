// Product Repository Interface - Single Responsibility: Product data access contract

import { IBaseRepository } from './IBaseRepository';
import { IProductData } from '../data';
import { IProductFilters } from '../filters';

export interface IProductRepository extends IBaseRepository<IProductData, IProductFilters> {
  findByIds(ids: string[]): Promise<IProductData[]>;
  createWithVariants(productData: any, variants?: any[]): Promise<IProductData>;
  updateWithVariants(id: string, productData: any, variants?: any[]): Promise<IProductData | null>;
  updateStock(id: string, newStock: number, reason?: string): Promise<IProductData | null>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
}
