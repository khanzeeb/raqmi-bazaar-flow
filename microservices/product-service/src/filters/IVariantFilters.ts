// Variant Filters Interface - Single Responsibility: Variant query filters only

import { VariantStatus } from '@prisma/client';
import { IBaseFilters } from './IBaseFilters';

export interface IVariantFilters extends IBaseFilters {
  product_id?: string;
  status?: VariantStatus;
}
