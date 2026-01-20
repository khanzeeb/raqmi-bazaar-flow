// Product Transformer - Handles all Product data transformations
// SOLID: Single Responsibility - Only transforms product data

import { Decimal } from '@prisma/client/runtime/library';
import { BaseTransformer } from './BaseTransformer';
import { CreateProductDTO, UpdateProductDTO } from '../dto';
import { IProductData } from '../interfaces/IProduct';

interface ProductCreateInput {
  name: string;
  sku: string;
  category: string;
  category_id?: string;
  price: Decimal;
  cost: Decimal;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  weight?: Decimal | null;
  image?: string;
  images: string[];
  description?: string;
  short_description?: string;
  status?: string;
  supplier?: string;
  barcode?: string;
  dimensions?: any;
  tags: string[];
}

interface VariantInput {
  name: string;
  sku?: string;
  price: Decimal;
  cost: Decimal;
  stock?: number;
  weight?: Decimal | null;
  images: string[];
  dimensions?: any;
  attributes: Record<string, any>;
}

export class ProductTransformer extends BaseTransformer<CreateProductDTO, IProductData> {
  /**
   * Transform create DTO to Prisma format
   */
  forCreate(data: CreateProductDTO): ProductCreateInput {
    return {
      name: data.name,
      sku: data.sku,
      category: data.category,
      category_id: data.category_id,
      price: this.toDecimalRequired(data.price),
      cost: this.toDecimalRequired(data.cost),
      stock: data.stock,
      min_stock: data.min_stock,
      max_stock: data.max_stock,
      weight: this.toNullableDecimal(data.weight) ?? null,
      image: data.image,
      images: this.ensureArray(data.images),
      description: data.description,
      short_description: data.short_description,
      status: data.status,
      supplier: data.supplier,
      barcode: data.barcode,
      dimensions: data.dimensions ?? null,
      tags: this.ensureArray(data.tags),
    };
  }

  /**
   * Transform update DTO to Prisma format (only provided fields)
   */
  forUpdate(data: Partial<UpdateProductDTO>): any {
    const result: any = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.sku !== undefined) result.sku = data.sku;
    if (data.category !== undefined) result.category = data.category;
    if (data.category_id !== undefined) result.category_id = data.category_id;
    if (data.price !== undefined) result.price = this.toDecimalRequired(data.price);
    if (data.cost !== undefined) result.cost = this.toDecimalRequired(data.cost);
    if (data.stock !== undefined) result.stock = data.stock;
    if (data.min_stock !== undefined) result.min_stock = data.min_stock;
    if (data.max_stock !== undefined) result.max_stock = data.max_stock;
    if (data.weight !== undefined) result.weight = this.toNullableDecimal(data.weight) ?? null;
    if (data.image !== undefined) result.image = data.image;
    if (data.images !== undefined) result.images = data.images;
    if (data.description !== undefined) result.description = data.description;
    if (data.short_description !== undefined) result.short_description = data.short_description;
    if (data.status !== undefined) result.status = data.status;
    if (data.supplier !== undefined) result.supplier = data.supplier;
    if (data.barcode !== undefined) result.barcode = data.barcode;
    if (data.dimensions !== undefined) result.dimensions = data.dimensions;
    if (data.tags !== undefined) result.tags = data.tags;

    return result;
  }

  /**
   * Transform variant DTO to Prisma format
   */
  forVariant(variant: any): VariantInput {
    return {
      name: variant.name,
      sku: variant.sku,
      price: this.toDecimalRequired(variant.price),
      cost: this.toDecimalRequired(variant.cost),
      stock: variant.stock,
      weight: this.toNullableDecimal(variant.weight) ?? null,
      images: this.ensureArray(variant.images),
      dimensions: variant.dimensions ?? null,
      attributes: this.ensureObject(variant.attributes),
    };
  }

  /**
   * Transform variants array
   */
  forVariants(variants: any[] | undefined): VariantInput[] | undefined {
    if (!variants) return undefined;
    return variants.map(v => this.forVariant(v));
  }

  /**
   * Transform database entity to API response format
   */
  toResponse(entity: any): IProductData {
    return {
      id: entity.id,
      name: entity.name,
      sku: entity.sku,
      category: entity.category,
      category_id: entity.category_id,
      price: this.toNumber(entity.price),
      cost: this.toNumber(entity.cost),
      stock: entity.stock ?? 0,
      min_stock: entity.min_stock ?? 0,
      max_stock: entity.max_stock ?? 0,
      image: entity.image,
      images: this.ensureArray(entity.images),
      description: entity.description,
      short_description: entity.short_description,
      status: entity.status,
      supplier: entity.supplier,
      barcode: entity.barcode,
      weight: this.toNullableNumber(entity.weight),
      dimensions: entity.dimensions,
      tags: this.ensureArray(entity.tags),
      category_info: this.mapCategoryInfo(entity.category_rel),
      variants: entity.variants?.map((v: any) => this.toVariantResponse(v)),
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  /**
   * Transform variant to API response format
   */
  private toVariantResponse(variant: any): any {
    return {
      id: variant.id,
      product_id: variant.product_id,
      name: variant.name,
      sku: variant.sku,
      price: this.toNumber(variant.price),
      cost: this.toNumber(variant.cost),
      stock: variant.stock ?? 0,
      weight: this.toNullableNumber(variant.weight),
      images: this.ensureArray(variant.images),
      dimensions: variant.dimensions,
      attributes: this.ensureObject(variant.attributes),
      sort_order: variant.sort_order ?? 0,
    };
  }

  /**
   * Map category relation to info object
   */
  private mapCategoryInfo(categoryRel: any): IProductData['category_info'] | undefined {
    if (!categoryRel) return undefined;
    return {
      id: categoryRel.id,
      name: categoryRel.name,
      slug: categoryRel.slug,
    };
  }
}

// Singleton instance
export const productTransformer = new ProductTransformer();
