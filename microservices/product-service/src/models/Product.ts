import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { IProductRepository } from '../interfaces/IRepository';
import ProductVariant, { ProductVariantData } from './ProductVariant';
import ProductCategory, { ProductCategoryData } from './ProductCategory';

export interface ProductData {
  id?: string;
  name: string;
  sku: string;
  category?: string; // Deprecated - use category_id
  category_id?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  image?: string;
  images?: string[];
  description?: string;
  short_description?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  variants?: ProductVariantData[];
  category_info?: ProductCategoryData;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // Deprecated
  category_id?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  priceRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
}

class ProductRepository extends BaseRepository<ProductData, ProductFilters> implements IProductRepository {
  protected tableName = 'products';

  async findById(id: string): Promise<ProductData | null> {
    const product = await this.db(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug'
      )
      .where('products.id', id)
      .first();
    
    if (product) {
      product.variants = await ProductVariant.findByProductId(id);
      
      if (product.category_name) {
        product.category_info = {
          id: product.category_id,
          name: product.category_name,
          slug: product.category_slug
        };
      }
      
      delete product.category_name;
      delete product.category_slug;
    }
    
    return product || null;
  }

  async findByIds(ids: string[]): Promise<ProductData[]> {
    return await this.db(this.tableName).whereIn('id', ids);
  }

  protected buildFindAllQuery(filters: ProductFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug'
      );
    
    this.applyCategoryFilter(query, filters);
    this.applyStatusFilter(query, filters);
    this.applyStockStatusFilter(query, filters);
    this.applyPriceRangeFilter(query, filters);
    this.applySupplierFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'products.name',
        'products.sku',
        'products.description',
        'product_categories.name'
      ]);
    }
    
    this.applySorting(query, `products.${filters.sortBy || 'created_at'}`, filters.sortOrder);
    
    return query;
  }

  protected buildCountQuery(filters: ProductFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .count('products.id as count');
    
    this.applyCategoryFilter(query, filters);
    this.applyStatusFilter(query, filters);
    this.applyStockStatusFilter(query, filters);
    this.applyPriceRangeFilter(query, filters);
    this.applySupplierFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'products.name',
        'products.sku',
        'products.description',
        'product_categories.name'
      ]);
    }
    
    return query;
  }

  private applyCategoryFilter(query: Knex.QueryBuilder, filters: ProductFilters): void {
    if (filters.category_id) {
      query.where('products.category_id', filters.category_id);
    } else if (filters.category) {
      query.where('product_categories.name', filters.category);
    }
  }

  private applyStatusFilter(query: Knex.QueryBuilder, filters: ProductFilters): void {
    if (filters.status) {
      query.where('products.status', filters.status);
    }
  }

  private applyStockStatusFilter(query: Knex.QueryBuilder, filters: ProductFilters): void {
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          query.where('products.stock', '<=', 0);
          break;
        case 'low-stock':
          query.whereRaw('products.stock <= products.min_stock AND products.stock > 0');
          break;
        case 'in-stock':
          query.whereRaw('products.stock > products.min_stock');
          break;
      }
    }
  }

  private applyPriceRangeFilter(query: Knex.QueryBuilder, filters: ProductFilters): void {
    if (filters.priceRange) {
      query.whereBetween('products.price', [filters.priceRange.min, filters.priceRange.max]);
    }
  }

  private applySupplierFilter(query: Knex.QueryBuilder, filters: ProductFilters): void {
    if (filters.supplier) {
      query.where('products.supplier', filters.supplier);
    }
  }

  async create(productData: Omit<ProductData, 'id' | 'created_at' | 'updated_at'>): Promise<ProductData> {
    const trx = await this.db.transaction();
    
    try {
      const [product] = await trx(this.tableName)
        .insert({
          ...productData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      if (productData.variants && productData.variants.length > 0) {
        const variants = productData.variants.map(variant => ({
          ...variant,
          product_id: product.id,
          created_at: new Date(),
          updated_at: new Date()
        }));
        
        await trx('product_variants').insert(variants);
      }
      
      await trx.commit();
      return await this.findById(product.id) as ProductData;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(id: string, productData: Partial<ProductData>): Promise<ProductData | null> {
    const trx = await this.db.transaction();
    
    try {
      await trx(this.tableName)
        .where({ id })
        .update({
          ...productData,
          updated_at: new Date()
        });
      
      if (productData.variants !== undefined) {
        await trx('product_variants').where({ product_id: id }).del();
        
        if (productData.variants.length > 0) {
          const variants = productData.variants.map(variant => ({
            ...variant,
            product_id: id,
            created_at: new Date(),
            updated_at: new Date()
          }));
          
          await trx('product_variants').insert(variants);
        }
      }
      
      await trx.commit();
      return await this.findById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const trx = await this.db.transaction();
    
    try {
      await trx('product_variants').where({ product_id: id }).del();
      await trx(this.tableName).where({ id }).del();
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updateStock(id: string, newStock: number, reason = ''): Promise<ProductData | null> {
    await this.db(this.tableName)
      .where({ id })
      .update({
        stock: newStock,
        updated_at: new Date()
      });
    
    await this.db('stock_movements').insert({
      product_id: id,
      type: 'adjustment',
      quantity: newStock,
      reason,
      created_at: new Date()
    });
    
    return await this.findById(id);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.db(this.tableName)
      .distinct('category')
      .whereNotNull('category')
      .orderBy('category');
    
    return result.map(row => row.category);
  }

  async getSuppliers(): Promise<string[]> {
    const result = await this.db(this.tableName)
      .distinct('supplier')
      .whereNotNull('supplier')
      .orderBy('supplier');
    
    return result.map(row => row.supplier);
  }
}

export default new ProductRepository();