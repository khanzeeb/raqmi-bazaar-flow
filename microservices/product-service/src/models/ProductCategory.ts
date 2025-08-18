import { Knex } from 'knex';
import db from '../config/database';

export interface ProductCategoryData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  meta_data?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductCategoryFilters {
  parent_id?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

class ProductCategory {
  static get tableName(): string {
    return 'product_categories';
  }

  static async findById(id: string): Promise<ProductCategoryData | null> {
    const category = await db(this.tableName).where({ id }).first();
    if (category) {
      // Get children categories
      category.children = await db(this.tableName)
        .where({ parent_id: id })
        .orderBy('sort_order', 'asc');
    }
    return category || null;
  }

  static async findAll(filters: ProductCategoryFilters = {}): Promise<{
    data: ProductCategoryData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let query = db(this.tableName);
    
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === '') {
        query = query.whereNull('parent_id');
      } else {
        query = query.where('parent_id', filters.parent_id);
      }
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function(this: Knex.QueryBuilder) {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const categories = await query
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: categories,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters: ProductCategoryFilters = {}): Promise<number> {
    let query = db(this.tableName).count('* as count');
    
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === '') {
        query = query.whereNull('parent_id');
      } else {
        query = query.where('parent_id', filters.parent_id);
      }
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function(this: Knex.QueryBuilder) {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count as string);
  }

  static async create(categoryData: ProductCategoryData): Promise<ProductCategoryData> {
    const [category] = await db(this.tableName)
      .insert({
        ...categoryData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return category;
  }

  static async update(id: string, categoryData: Partial<ProductCategoryData>): Promise<ProductCategoryData | null> {
    const [category] = await db(this.tableName)
      .where({ id })
      .update({
        ...categoryData,
        updated_at: new Date()
      })
      .returning('*');
    
    return category || null;
  }

  static async delete(id: string): Promise<boolean> {
    const trx = await db.transaction();
    
    try {
      // Move children to parent's parent or set to null
      await trx(this.tableName)
        .where({ parent_id: id })
        .update({ parent_id: null });
      
      // Delete the category
      await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getTree(): Promise<ProductCategoryData[]> {
    const categories = await db(this.tableName)
      .where({ status: 'active' })
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc');
    
    // Build tree structure
    const categoryMap = new Map();
    const tree: ProductCategoryData[] = [];
    
    // First pass: create map
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
    
    // Second pass: build tree
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id);
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        categoryMap.get(category.parent_id).children.push(categoryWithChildren);
      } else {
        tree.push(categoryWithChildren);
      }
    });
    
    return tree;
  }
}

export default ProductCategory;