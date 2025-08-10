import { Knex } from 'knex';
import db from '../config/database';
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

class Product {
  static get tableName(): string {
    return 'products';
  }

  static async findById(id: string): Promise<ProductData | null> {
    const product = await db(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug'
      )
      .where('products.id', id)
      .first();
    
    if (product) {
      // Get variants
      product.variants = await ProductVariant.findByProductId(id);
      
      // Format category info
      if (product.category_name) {
        product.category_info = {
          id: product.category_id,
          name: product.category_name,
          slug: product.category_slug
        };
      }
      
      // Clean up joined fields
      delete product.category_name;
      delete product.category_slug;
    }
    
    return product || null;
  }

  static async findByIds(ids: string[]): Promise<ProductData[]> {
    return await db(this.tableName).whereIn('id', ids);
  }

  static async findAll(filters: ProductFilters = {}): Promise<{
    data: ProductData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let query = db(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.slug as category_slug'
      );
    
    // Handle both old category (string) and new category_id filters
    if (filters.category_id) {
      query = query.where('products.category_id', filters.category_id);
    } else if (filters.category) {
      // Legacy support - search by category name
      query = query.where('product_categories.name', filters.category);
    }
    
    if (filters.status) {
      query = query.where('products.status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function(this: Knex.QueryBuilder) {
        this.where('products.name', 'ilike', `%${filters.search}%`)
            .orWhere('products.sku', 'ilike', `%${filters.search}%`)
            .orWhere('products.description', 'ilike', `%${filters.search}%`)
            .orWhere('product_categories.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          query = query.where('products.stock', '<=', 0);
          break;
        case 'low-stock':
          query = query.whereRaw('products.stock <= products.min_stock AND products.stock > 0');
          break;
        case 'in-stock':
          query = query.whereRaw('products.stock > products.min_stock');
          break;
      }
    }
    
    if (filters.priceRange) {
      query = query.whereBetween('products.price', [filters.priceRange.min, filters.priceRange.max]);
    }
    
    if (filters.supplier) {
      query = query.where('products.supplier', filters.supplier);
    }
    
    const limit = filters.limit || 10;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const products = await query
      .orderBy(`products.${filters.sortBy || 'created_at'}`, filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    // Format category info for each product
    const formattedProducts = products.map(product => {
      if (product.category_name) {
        product.category_info = {
          id: product.category_id,
          name: product.category_name,
          slug: product.category_slug
        };
      }
      
      // Clean up joined fields
      delete product.category_name;
      delete product.category_slug;
      
      return product;
    });
    
    const total = await this.count(filters);
    
    return {
      data: formattedProducts,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters: ProductFilters = {}): Promise<number> {
    let query = db(this.tableName)
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .count('products.id as count');
    
    if (filters.category_id) {
      query = query.where('products.category_id', filters.category_id);
    } else if (filters.category) {
      query = query.where('product_categories.name', filters.category);
    }
    
    if (filters.status) {
      query = query.where('products.status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function(this: Knex.QueryBuilder) {
        this.where('products.name', 'ilike', `%${filters.search}%`)
            .orWhere('products.sku', 'ilike', `%${filters.search}%`)
            .orWhere('products.description', 'ilike', `%${filters.search}%`)
            .orWhere('product_categories.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count as string);
  }

  static async create(productData: ProductData): Promise<ProductData> {
    const trx = await db.transaction();
    
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

  static async update(id: string, productData: Partial<ProductData>): Promise<ProductData | null> {
    const trx = await db.transaction();
    
    try {
      const [product] = await trx(this.tableName)
        .where({ id })
        .update({
          ...productData,
          updated_at: new Date()
        })
        .returning('*');
      
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

  static async delete(id: string): Promise<boolean> {
    const trx = await db.transaction();
    
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

  static async updateStock(id: string, newStock: number, reason = ''): Promise<ProductData | null> {
    const [product] = await db(this.tableName)
      .where({ id })
      .update({
        stock: newStock,
        updated_at: new Date()
      })
      .returning('*');
    
    // Log stock movement
    await db('stock_movements').insert({
      product_id: id,
      type: 'adjustment',
      quantity: newStock,
      reason,
      created_at: new Date()
    });
    
    return product || null;
  }

  static async getCategories(): Promise<string[]> {
    const result = await db(this.tableName)
      .distinct('category')
      .whereNotNull('category')
      .orderBy('category');
    
    return result.map(row => row.category);
  }

  static async getSuppliers(): Promise<string[]> {
    const result = await db(this.tableName)
      .distinct('supplier')
      .whereNotNull('supplier')
      .orderBy('supplier');
    
    return result.map(row => row.supplier);
  }
}

export default Product;