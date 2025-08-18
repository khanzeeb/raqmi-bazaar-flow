import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { IProductVariantRepository } from '../interfaces/IRepository';

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

class ProductVariantRepository extends BaseRepository<ProductVariantData, ProductVariantFilters> implements IProductVariantRepository {
  protected tableName = 'product_variants';

  async findByProductId(productId: string): Promise<ProductVariantData[]> {
    return await this.db(this.tableName)
      .where({ product_id: productId })
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc');
  }

  protected buildFindAllQuery(filters: ProductVariantFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName);
    
    this.applyProductFilter(query, filters);
    this.applyStatusFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'sku', 'barcode']);
    }
    
    return query.orderBy('sort_order', 'asc').orderBy('name', 'asc');
  }

  protected buildCountQuery(filters: ProductVariantFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('* as count');
    
    this.applyProductFilter(query, filters);
    this.applyStatusFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'sku', 'barcode']);
    }
    
    return query;
  }

  private applyProductFilter(query: Knex.QueryBuilder, filters: ProductVariantFilters): void {
    if (filters.product_id) {
      query.where('product_id', filters.product_id);
    }
  }

  private applyStatusFilter(query: Knex.QueryBuilder, filters: ProductVariantFilters): void {
    if (filters.status) {
      query.where('status', filters.status);
    }
  }

  async createMultiple(variants: Omit<ProductVariantData, 'id' | 'created_at' | 'updated_at'>[]): Promise<ProductVariantData[]> {
    const variantsWithTimestamps = variants.map(variant => ({
      ...variant,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    return await this.db(this.tableName)
      .insert(variantsWithTimestamps)
      .returning('*');
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const result = await this.db(this.tableName).where({ product_id: productId }).del();
    return result >= 0;
  }

  async updateStock(id: string, newStock: number, reason = ''): Promise<ProductVariantData | null> {
    await this.db(this.tableName)
      .where({ id })
      .update({
        stock: newStock,
        updated_at: new Date()
      });
    
    await this.db('stock_movements').insert({
      product_variant_id: id,
      type: 'adjustment',
      quantity: newStock,
      reason,
      created_at: new Date()
    });
    
    return await this.findById(id);
  }
}

export default new ProductVariantRepository();