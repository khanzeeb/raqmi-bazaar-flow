// Product Module Types

export type ProductStatus = 'active' | 'inactive' | 'discontinued';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  attributes?: Record<string, unknown>;
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  name_ar?: string;
  sku: string;
  category: string;
  category_id?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  status: ProductStatus;
  image?: string;
  images?: string[];
  description?: string;
  short_description?: string;
  variants?: ProductVariant[];
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  category_id?: string;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  supplier?: string;
  priceRange?: { min: number; max: number };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface CreateProductInput {
  name: string;
  name_ar?: string;
  sku: string;
  category: string;
  category_id?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  image?: string;
  description?: string;
  short_description?: string;
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: ProductStatus;
}

export interface UpdateStockInput {
  stock: number;
  reason?: string;
}
