// Variant Repository Interface - Single Responsibility: Variant data access contract

import type { IVariantData } from '../data/IVariantData';
import type { IVariantFilters } from '../filters/IVariantFilters';
import type { IPaginatedResponse } from './BaseRepository';

export interface IVariantRepository {
  findById(id: string): Promise<IVariantData | null>;
  findAll(filters?: IVariantFilters, page?: number, limit?: number): Promise<IPaginatedResponse<IVariantData>>;
  findByProductId(productId: string): Promise<IVariantData[]>;
  create(data: any): Promise<IVariantData>;
  createForProduct(productId: string, data: any): Promise<IVariantData>;
  createMultiple(variants: any[]): Promise<number>;
  update(id: string, data: any): Promise<IVariantData | null>;
  updateStock(id: string, newStock: number, reason?: string): Promise<IVariantData | null>;
  delete(id: string): Promise<boolean>;
  deleteByProductId(productId: string): Promise<boolean>;
  count(filters?: IVariantFilters): Promise<number>;
}
