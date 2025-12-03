// Product Mapper - Single Responsibility: Data transformation only

import { IProductData, IProductVariantData } from '../interfaces/IProduct';

export class ProductMapper {
  /**
   * Transform database product to API response format
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
      images: item.images ?? [],
      description: item.description,
      short_description: item.short_description,
      status: item.status,
      supplier: item.supplier,
      barcode: item.barcode,
      weight: this.toNullableNumber(item.weight),
      dimensions: item.dimensions,
      tags: item.tags ?? [],
      category_info: this.mapCategoryInfo(item.category_rel),
      variants: item.variants?.map((v: any) => this.toVariantData(v)),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  /**
   * Transform database variant to API response format
   */
  toVariantData(item: any): IProductVariantData {
    return {
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      sku: item.sku,
      price: this.toNumber(item.price),
      cost: this.toNumber(item.cost),
      stock: item.stock ?? 0,
      weight: this.toNullableNumber(item.weight),
      images: item.images ?? [],
      dimensions: item.dimensions,
      attributes: item.attributes ?? {},
      sort_order: item.sort_order ?? 0,
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

  /**
   * Convert Decimal/string to number with default 0
   */
  private toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(value);
  }

  /**
   * Convert Decimal/string to nullable number
   */
  private toNullableNumber(value: any): number | undefined {
    if (value === null || value === undefined) return undefined;
    return Number(value);
  }
}
