import { ProductCategoryData } from './ProductCategory';
import { ProductVariantData } from './ProductVariant';

export interface ProductData {
  id?: string;
  name: string;
  sku: string;
  category?: string; // Deprecated - use category_id
  category_id?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  image?: string;
  images?: string[];
  description?: string;
  short_description?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  variants?: ProductVariantData[];
  category_info?: ProductCategoryData;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // Deprecated
  category_id?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  priceRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
}
