// Product Mapper Implementation - Single Responsibility: Product data transformation

import { Decimal } from '@prisma/client/runtime/library';
import { IProductData, IProductVariantData, ICategoryInfo } from '../data';
import { IProductMapper } from './IProductMapper';

export class ProductMapper implements IProductMapper {
  /**
   * Map database entity to product data
   */
  toProductData(item: any): IProductData {
    return {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      category_id: item.category_id,
      price: this.toNumber(item.price),
      cost: this.toNumber(item.cost),
      stock: item.stock ?? 0,
      min_stock: item.min_stock ?? 0,
      max_stock: item.max_stock ?? 0,
      image: item.image,
      images: this.toArray(item.images),
      description: item.description,
      short_description: item.short_description,
      status: item.status,
      supplier: item.supplier,
      barcode: item.barcode,
      weight: this.toNullableNumber(item.weight),
      dimensions: item.dimensions,
      tags: this.toArray(item.tags),
      category_info: this.mapCategoryInfo(item.category_rel),
      variants: item.variants?.map((v: any) => this.toVariantData(v)),
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  /**
   * Map database entity to variant data
   */
  toVariantData(item: any): IProductVariantData {
    return {
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
      price: this.toNumber(item.price),
      cost: this.toNumber(item.cost),
      stock: item.stock ?? 0,
      min_stock: item.min_stock ?? 0,
      weight: this.toNullableNumber(item.weight),
      images: this.toArray(item.images),
      dimensions: item.dimensions,
      attributes: item.attributes ?? {},
      status: item.status,
      sort_order: item.sort_order ?? 0,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  /**
   * Map product data to database format for create
   */
  toDatabase(data: any): any {
    return {
      name: data.name,
      sku: data.sku,
      category: data.category,
      category_id: data.category_id,
      price: this.toDecimal(data.price),
      cost: this.toDecimal(data.cost),
      stock: data.stock ?? 0,
      min_stock: data.min_stock ?? 0,
      max_stock: data.max_stock ?? 0,
      image: data.image,
      images: data.images ?? [],
      description: data.description,
      short_description: data.short_description,
      status: data.status ?? 'active',
      supplier: data.supplier,
      barcode: data.barcode,
      weight: data.weight ? this.toDecimal(data.weight) : null,
      dimensions: data.dimensions ?? null,
      tags: data.tags ?? []
    };
  }

  /**
   * Map product data to database format for update
   */
  toDatabaseUpdate(data: any): any {
    const result: any = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.sku !== undefined) result.sku = data.sku;
    if (data.category !== undefined) result.category = data.category;
    if (data.category_id !== undefined) result.category_id = data.category_id;
    if (data.price !== undefined) result.price = this.toDecimal(data.price);
    if (data.cost !== undefined) result.cost = this.toDecimal(data.cost);
    if (data.stock !== undefined) result.stock = data.stock;
    if (data.min_stock !== undefined) result.min_stock = data.min_stock;
    if (data.max_stock !== undefined) result.max_stock = data.max_stock;
    if (data.image !== undefined) result.image = data.image;
    if (data.images !== undefined) result.images = data.images;
    if (data.description !== undefined) result.description = data.description;
    if (data.short_description !== undefined) result.short_description = data.short_description;
    if (data.status !== undefined) result.status = data.status;
    if (data.supplier !== undefined) result.supplier = data.supplier;
    if (data.barcode !== undefined) result.barcode = data.barcode;
    if (data.weight !== undefined) result.weight = data.weight ? this.toDecimal(data.weight) : null;
    if (data.dimensions !== undefined) result.dimensions = data.dimensions;
    if (data.tags !== undefined) result.tags = data.tags;

    return result;
  }

  // Private helpers

  private mapCategoryInfo(categoryRel: any): ICategoryInfo | undefined {
    if (!categoryRel) return undefined;
    return {
      id: categoryRel.id,
      name: categoryRel.name,
      slug: categoryRel.slug
    };
  }

  private toNumber(value: Decimal | string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    return Number(value);
  }

  private toNullableNumber(value: Decimal | string | number | null | undefined): number | undefined {
    if (value === null || value === undefined) return undefined;
    return Number(value);
  }

  private toArray<T>(value: T[] | null | undefined): T[] {
    return value ?? [];
  }

  private toDecimal(value: number): Decimal {
    return new Decimal(value);
  }
}
