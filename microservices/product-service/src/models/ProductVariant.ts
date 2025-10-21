export interface ProductVariantData {
  id?: string;
  product_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
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
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductVariantFilters {
  product_id?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}
