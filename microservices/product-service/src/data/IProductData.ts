// Product Data Interface - Single Responsibility: Product entity types only

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
  dimensions?: IDimensions | null;
  tags: string[];
  category_info?: ICategoryInfo;
  variants?: IProductVariantData[];
  created_at: Date;
  updated_at: Date;
}

export interface IProductVariantData {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  weight?: number | null;
  images: string[];
  dimensions?: IDimensions | null;
  attributes: Record<string, any>;
  status: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface IDimensions {
  length: number;
  width: number;
  height: number;
}
