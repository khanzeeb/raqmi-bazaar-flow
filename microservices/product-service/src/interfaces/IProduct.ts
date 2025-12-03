// Product interfaces - Single Responsibility: Type definitions only

import { ProductStatus } from '@prisma/client';

export interface IProductData {
  id: string;
  name: string;
  sku: string;
  category?: string;
  category_id?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  image?: string;
  images: string[];
  description?: string;
  short_description?: string;
  status: ProductStatus;
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number } | null;
  tags: string[];
  category_info?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: IProductVariantData[];
  created_at: Date;
  updated_at: Date;
}

export interface IProductVariantData {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  weight?: number;
  images: string[];
  dimensions?: { length: number; width: number; height: number } | null;
  attributes: Record<string, any>;
  sort_order: number;
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  category_id?: string;
  status?: ProductStatus;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  priceRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
