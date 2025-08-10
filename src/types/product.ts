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
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes?: Record<string, any>;
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  sort_order?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status: 'active' | 'inactive';
  children?: ProductCategory[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string; // Deprecated - use category_id
  category_id?: string;
  category_info?: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  image?: string;
  images?: string[];
  description?: string;
  short_description?: string;
  variants?: ProductVariant[];
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category?: string; // Deprecated
  category_id?: string;
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
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductFilters {
  category?: string; // Deprecated
  category_id?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  priceRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
}