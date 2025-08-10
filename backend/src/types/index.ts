export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// Re-export model types
export type { ProductData, ProductFilters } from '../models/Product';
export type { ProductCategoryData, ProductCategoryFilters } from '../models/ProductCategory';
export type { ProductVariantData, ProductVariantFilters } from '../models/ProductVariant';