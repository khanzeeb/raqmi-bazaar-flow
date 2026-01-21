// Product Filters Interface - Single Responsibility: Product query filters only

import { ProductStatus } from '@prisma/client';
import { IBaseFilters } from './IBaseFilters';

export interface IProductFilters extends IBaseFilters {
  category?: string;
  category_id?: string;
  status?: ProductStatus;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  supplier?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}
