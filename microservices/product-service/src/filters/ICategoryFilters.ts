// Category Filters Interface - Single Responsibility: Category query filters only

import { CategoryStatus } from '@prisma/client';
import { IBaseFilters } from './IBaseFilters';

export interface ICategoryFilters extends IBaseFilters {
  parent_id?: string | null;
  status?: CategoryStatus;
}
