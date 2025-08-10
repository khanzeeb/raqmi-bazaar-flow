import { Knex } from 'knex';
import db from '../config/database';

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

class ProductVariant {
  static get tableName(): string {
    return 'product_variants';
  }

  static async findById(id: string): Promise<ProductVariantData | null> {
    const variant = await db(this.tableName).where({ id }).first();
    return variant || null;
  }

  static async findByProductId(productId: string): Promise<ProductVariantData[]> {
    return await db(this.tableName)
      .where({ product_id: productId })
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc');
  }

  static async findAll(filters: ProductVariantFilters = {}): Promise<{
    data: ProductVariantData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let query = db(this.tableName);
    
    if (filters.product_id) {
      query = query.where('product_id', filters.product_id);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function(this: Knex.QueryBuilder) {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('sku', 'ilike', `%${filters.search}%`)
            .orWhere('barcode', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const variants = await query
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: variants,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters: ProductVariantFilters = {}): Promise<number> {
    let query = db(this.tableName).count('* as count');
    
    if (filters.product_id) {
      query = query.where('product_id', filters.product_id);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function(this: Knex.QueryBuilder) {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('sku', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count as string);
  }

  static async create(variantData: ProductVariantData): Promise<ProductVariantData> {
    const [variant] = await db(this.tableName)
      .insert({
        ...variantData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return variant;
  }

  static async createMultiple(variants: ProductVariantData[]): Promise<ProductVariantData[]> {
    const variantsWithTimestamps = variants.map(variant => ({
      ...variant,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    return await db(this.tableName)
      .insert(variantsWithTimestamps)
      .returning('*');
  }

  static async update(id: string, variantData: Partial<ProductVariantData>): Promise<ProductVariantData | null> {
    const [variant] = await db(this.tableName)
      .where({ id })
      .update({
        ...variantData,
        updated_at: new Date()
      })
      .returning('*');
    
    return variant || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db(this.tableName).where({ id }).del();
    return result > 0;
  }

  static async deleteByProductId(productId: string): Promise<boolean> {
    const result = await db(this.tableName).where({ product_id: productId }).del();
    return result >= 0;
  }

  static async updateStock(id: string, newStock: number, reason = ''): Promise<ProductVariantData | null> {
    const [variant] = await db(this.tableName)
      .where({ id })
      .update({
        stock: newStock,
        updated_at: new Date()
      })
      .returning('*');
    
    // Log stock movement
    await db('stock_movements').insert({
      product_variant_id: id,
      type: 'adjustment',
      quantity: newStock,
      reason,
      created_at: new Date()
    });
    
    return variant || null;
  }
}

export default ProductVariant;