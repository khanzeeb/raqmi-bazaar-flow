export interface ProductCategoryData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  meta_data?: Record<string, any>;
  children?: ProductCategoryData[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductCategoryFilters {
  parent_id?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}
