// Variant Repository Interface - Single Responsibility: Variant data access contract

import { IBaseRepository } from './IBaseRepository';
import { IProductVariantData } from '../data';
import { IVariantFilters } from '../filters';

export interface IVariantRepository extends IBaseRepository<IProductVariantData, IVariantFilters> {
  findByProductId(productId: string): Promise<IProductVariantData[]>;
  createForProduct(productId: string, data: any): Promise<IProductVariantData>;
  createMultiple(variants: any[]): Promise<number>;
  deleteByProductId(productId: string): Promise<boolean>;
  updateStock(id: string, newStock: number, reason?: string): Promise<IProductVariantData | null>;
}
