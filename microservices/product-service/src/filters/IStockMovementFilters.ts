// Stock Movement Filters Interface - Single Responsibility: Stock movement query filters only

import { MovementType } from '@prisma/client';
import { IBaseFilters } from './IBaseFilters';

export interface IStockMovementFilters extends IBaseFilters {
  product_id?: string;
  product_variant_id?: string;
  type?: MovementType;
  start_date?: Date;
  end_date?: Date;
}
