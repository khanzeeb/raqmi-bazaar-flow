// Variant Transformer - Handles all ProductVariant data transformations
// SOLID: Single Responsibility - Only transforms variant data

import { ProductVariant } from '@prisma/client';
import { BaseTransformer } from './BaseTransformer';

export interface VariantCreateInput {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  attributes?: Record<string, any>;
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  sort_order?: number;
}

export interface VariantData {
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
  dimensions: any;
  attributes: Record<string, any>;
  images: string[];
  status: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export class VariantTransformer extends BaseTransformer<VariantCreateInput, VariantData> {
  /**
   * Transform create DTO to Prisma format
   */
  forCreate(data: VariantCreateInput): any {
    return {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      price: this.toDecimalRequired(data.price),
      cost: this.toDecimalRequired(data.cost),
      stock: data.stock ?? 0,
      min_stock: data.min_stock ?? 0,
      weight: this.toNullableDecimal(data.weight) ?? null,
      dimensions: data.dimensions ?? null,
      attributes: this.ensureObject(data.attributes),
      images: this.ensureArray(data.images),
      status: data.status ?? 'active',
      sort_order: data.sort_order ?? 0,
    };
  }

  /**
   * Transform update DTO to Prisma format (only provided fields)
   */
  forUpdate(data: Partial<VariantCreateInput>): any {
    const result: any = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.sku !== undefined) result.sku = data.sku;
    if (data.barcode !== undefined) result.barcode = data.barcode;
    if (data.price !== undefined) result.price = this.toDecimalRequired(data.price);
    if (data.cost !== undefined) result.cost = this.toDecimalRequired(data.cost);
    if (data.stock !== undefined) result.stock = data.stock;
    if (data.min_stock !== undefined) result.min_stock = data.min_stock;
    if (data.weight !== undefined) result.weight = this.toNullableDecimal(data.weight) ?? null;
    if (data.dimensions !== undefined) result.dimensions = data.dimensions;
    if (data.attributes !== undefined) result.attributes = data.attributes;
    if (data.images !== undefined) result.images = data.images;
    if (data.status !== undefined) result.status = data.status;
    if (data.sort_order !== undefined) result.sort_order = data.sort_order;

    return result;
  }

  /**
   * Transform database entity to API response format
   */
  toResponse(entity: ProductVariant): VariantData {
    return {
      id: entity.id,
      product_id: entity.product_id,
      name: entity.name,
      sku: entity.sku,
      barcode: entity.barcode,
      price: this.toNumber(entity.price),
      cost: this.toNumber(entity.cost),
      stock: entity.stock ?? 0,
      min_stock: entity.min_stock ?? 0,
      weight: this.toNullableNumber(entity.weight),
      dimensions: entity.dimensions,
      attributes: this.ensureObject(entity.attributes as Record<string, any>),
      images: this.ensureArray(entity.images as string[]),
      status: entity.status,
      sort_order: entity.sort_order ?? 0,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  /**
   * Transform list of variants
   */
  toResponseList(entities: ProductVariant[]): VariantData[] {
    return entities.map(entity => this.toResponse(entity));
  }
}

// Singleton instance
export const variantTransformer = new VariantTransformer();
