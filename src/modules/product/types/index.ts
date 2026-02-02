// Product Module Types - Single source of truth for product-related types

// Status types
export type ProductStatus = 'active' | 'inactive' | 'discontinued';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

// Dimensions
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

// Variant
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

// Core Product
export interface Product {
  id: string;
  name: string;
  nameAr?: string;
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
  created_at: string;
  updated_at: string;
}

// Create/Update DTOs
export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  image?: string;
  description?: string;
  short_description?: string;
  variants?: Omit<ProductVariant, 'id' | 'product_id'>[];
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}

// Filters
export interface ProductFilters {
  category?: string;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  priceRange?: { min: number; max: number };
  supplier?: string;
  search?: string;
}

// Stats
export interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

// View product for UI (simplified)
export interface ProductView {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  variants?: string[];
  barcode?: string;
}
