export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  image?: string;
  images?: string[];
  description?: string;
  shortDescription?: string;
  variants?: ProductVariant[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
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
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  image?: string;
  description?: string;
  shortDescription?: string;
  variants?: Omit<ProductVariant, 'id'>[];
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
  category?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  priceRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
}