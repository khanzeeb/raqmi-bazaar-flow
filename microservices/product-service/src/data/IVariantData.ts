// Variant Data Interface - Single Responsibility: Variant data contract

export interface IVariantData {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  weight: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  attributes: Record<string, any> | null;
  image: string | null;
  images: string[] | null;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}
