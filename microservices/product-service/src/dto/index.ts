// Centralized DTO exports - KISS: Single source of truth for DTOs
// DRY: All DTOs in one place to avoid duplication

// =============== Product DTOs ===============
export interface CreateProductDTO {
  name: string;
  sku: string;
  category?: string;
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
  status?: ProductStatus;
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: Dimensions;
  tags?: string[];
  variants?: CreateVariantDTO[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface UpdateStockDTO {
  stock: number;
  reason?: string;
}

// =============== Variant DTOs ===============
export interface CreateVariantDTO {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  weight?: number;
  dimensions?: Dimensions;
  attributes?: Record<string, any>;
  image?: string;
  images?: string[];
  status?: VariantStatus;
  sort_order?: number;
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> {
  id?: string;
}

// =============== Category DTOs ===============
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status?: CategoryStatus;
  meta_data?: Record<string, any>;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

// =============== Stock Movement DTOs ===============
export interface CreateStockMovementDTO {
  product_id?: string;
  product_variant_id?: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference_id?: string;
  reference_type?: string;
}

export interface UpdateStockMovementDTO extends Partial<Omit<CreateStockMovementDTO, 'product_id' | 'product_variant_id'>> {}

// =============== Common Types ===============
export type ProductStatus = 'active' | 'inactive' | 'discontinued';
export type VariantStatus = 'active' | 'inactive';
export type CategoryStatus = 'active' | 'inactive';
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer' | 'damaged' | 'expired';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

// =============== Filter DTOs ===============
export interface PaginationDTO {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ProductFiltersDTO extends PaginationDTO {
  category?: string;
  category_id?: string;
  status?: ProductStatus;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  supplier?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface CategoryFiltersDTO extends PaginationDTO {
  parent_id?: string | null;
  status?: CategoryStatus;
}

export interface VariantFiltersDTO extends PaginationDTO {
  product_id?: string;
  status?: VariantStatus;
}

export interface StockMovementFiltersDTO extends PaginationDTO {
  product_id?: string;
  product_variant_id?: string;
  type?: MovementType;
  start_date?: string;
  end_date?: string;
}
