// Category Data Interface - Single Responsibility: Category entity types only

import { CategoryStatus } from '@prisma/client';

export interface ICategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parent_id?: string | null;
  sort_order: number;
  status: CategoryStatus;
  meta_data?: Record<string, any>;
  children?: ICategoryData[];
  created_at: Date;
  updated_at: Date;
}
