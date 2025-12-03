// Product DTOs - Single Responsibility: Data transfer definitions

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
  status?: 'active' | 'inactive' | 'discontinued';
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  tags?: string[];
  variants?: CreateVariantDTO[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface CreateVariantDTO {
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock?: number;
  weight?: number;
  images?: string[];
  dimensions?: { length: number; width: number; height: number };
  attributes?: Record<string, any>;
  sort_order?: number;
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> {
  id?: string;
}

export interface UpdateStockDTO {
  stock: number;
  reason?: string;
}
