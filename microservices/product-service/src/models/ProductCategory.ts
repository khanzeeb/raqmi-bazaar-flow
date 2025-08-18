import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { IProductCategoryRepository } from '../interfaces/IRepository';

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
  children?: ProductCategoryData[];
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

class ProductCategoryRepository extends BaseRepository<ProductCategoryData, ProductCategoryFilters> implements IProductCategoryRepository {
  protected tableName = 'product_categories';

  async findById(id: string): Promise<ProductCategoryData | null> {
    const category = await this.db(this.tableName).where({ id }).first();
    if (category) {
      category.children = await this.db(this.tableName)
        .where({ parent_id: id })
        .orderBy('sort_order', 'asc');
    }
    return category || null;
  }

  protected buildFindAllQuery(filters: ProductCategoryFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName);
    
    this.applyParentFilter(query, filters);
    this.applyStatusFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'description']);
    }
    
    return query.orderBy('sort_order', 'asc').orderBy('name', 'asc');
  }

  protected buildCountQuery(filters: ProductCategoryFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('* as count');
    
    this.applyParentFilter(query, filters);
    this.applyStatusFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'description']);
    }
    
    return query;
  }

  private applyParentFilter(query: Knex.QueryBuilder, filters: ProductCategoryFilters): void {
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === '') {
        query.whereNull('parent_id');
      } else {
        query.where('parent_id', filters.parent_id);
      }
    }
  }

  private applyStatusFilter(query: Knex.QueryBuilder, filters: ProductCategoryFilters): void {
    if (filters.status) {
      query.where('status', filters.status);
    }
  }

  async delete(id: string): Promise<boolean> {
    const trx = await this.db.transaction();
    
    try {
      await trx(this.tableName)
        .where({ parent_id: id })
        .update({ parent_id: null });
      
      await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getTree(): Promise<ProductCategoryData[]> {
    const categories = await this.db(this.tableName)
      .where({ status: 'active' })
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc');
    
    const categoryMap = new Map();
    const tree: ProductCategoryData[] = [];
    
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
    
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

export default new ProductCategoryRepository();