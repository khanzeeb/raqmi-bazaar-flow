// Variant Mapper Implementation - Single Responsibility: Variant data transformation

import { Decimal } from '@prisma/client/runtime/library';
import { IProductVariantData } from '../data';
import { IVariantMapper } from './IVariantMapper';

export class VariantMapper implements IVariantMapper {
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
      images: item.images ?? [],
      dimensions: item.dimensions,
      attributes: item.attributes ?? {},
      status: item.status,
      sort_order: item.sort_order ?? 0,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  /**
   * Map variant data to database format for create
   */
  toDatabase(data: any): any {
    return {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      price: this.toDecimal(data.price),
      cost: this.toDecimal(data.cost),
      stock: data.stock ?? 0,
      min_stock: data.min_stock ?? 0,
      weight: data.weight ? this.toDecimal(data.weight) : null,
      dimensions: data.dimensions ?? null,
      attributes: data.attributes ?? {},
      images: data.images ?? [],
      status: data.status ?? 'active',
      sort_order: data.sort_order ?? 0
    };
  }

  /**
   * Map variant data to database format for update
   */
  toDatabaseUpdate(data: any): any {
    const result: any = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.sku !== undefined) result.sku = data.sku;
    if (data.barcode !== undefined) result.barcode = data.barcode;
    if (data.price !== undefined) result.price = this.toDecimal(data.price);
    if (data.cost !== undefined) result.cost = this.toDecimal(data.cost);
    if (data.stock !== undefined) result.stock = data.stock;
    if (data.min_stock !== undefined) result.min_stock = data.min_stock;
    if (data.weight !== undefined) result.weight = data.weight ? this.toDecimal(data.weight) : null;
    if (data.dimensions !== undefined) result.dimensions = data.dimensions;
    if (data.attributes !== undefined) result.attributes = data.attributes;
    if (data.images !== undefined) result.images = data.images;
    if (data.status !== undefined) result.status = data.status;
    if (data.sort_order !== undefined) result.sort_order = data.sort_order;

    return result;
  }

  // Private helpers

  private toNumber(value: Decimal | string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    return Number(value);
  }

  private toNullableNumber(value: Decimal | string | number | null | undefined): number | undefined {
    if (value === null || value === undefined) return undefined;
    return Number(value);
  }

  private toDecimal(value: number): Decimal {
    return new Decimal(value);
  }
}
