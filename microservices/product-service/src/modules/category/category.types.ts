// Category Module Types

export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image?: string;
  sort_order: number;
  status: CategoryStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  parent_id?: string;
  status?: CategoryStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryInput {
  name: string;
  name_ar?: string;
  description?: string;
  parent_id?: string;
  image?: string;
  sort_order?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}
