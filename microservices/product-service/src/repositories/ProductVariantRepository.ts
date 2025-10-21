import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { IProductVariantRepository } from '../interfaces/IRepository';
import { ProductVariantData, ProductVariantFilters } from '../models/ProductVariant';
import ProductVariantMapper from '../mappers/ProductVariantMapper';

class ProductVariantRepository extends BaseRepository<ProductVariantData, ProductVariantFilters> implements IProductVariantRepository {
  protected tableName = 'product_variants';

  async findById(id: string): Promise<ProductVariantData | null> {
    const variant = await this.db(this.tableName).where({ id }).first();
    return variant ? ProductVariantMapper.toProductVariantData(variant) : null;
  }

  async findByProductId(productId: string): Promise<ProductVariantData[]> {
    const variants = await this.db(this.tableName)
      .where({ product_id: productId })
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc');
    
    return ProductVariantMapper.toProductVariantDataList(variants);
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

  async create(data: Omit<ProductVariantData, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariantData> {
    const dbData = ProductVariantMapper.toDatabase(data);
    const [variant] = await this.db(this.tableName)
      .insert({
        ...dbData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return ProductVariantMapper.toProductVariantData(variant);
  }

  async update(id: string, data: Partial<ProductVariantData>): Promise<ProductVariantData | null> {
    const dbData = ProductVariantMapper.toDatabase(data);
    const [variant] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...dbData,
        updated_at: new Date()
      })
      .returning('*');
    
    return variant ? ProductVariantMapper.toProductVariantData(variant) : null;
  }

  async createMultiple(variants: Omit<ProductVariantData, 'id' | 'created_at' | 'updated_at'>[]): Promise<ProductVariantData[]> {
    const variantsWithTimestamps = variants.map(variant => {
      const dbData = ProductVariantMapper.toDatabase(variant);
      return {
        ...dbData,
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    
    const createdVariants = await this.db(this.tableName)
      .insert(variantsWithTimestamps)
      .returning('*');
    
    return ProductVariantMapper.toProductVariantDataList(createdVariants);
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
