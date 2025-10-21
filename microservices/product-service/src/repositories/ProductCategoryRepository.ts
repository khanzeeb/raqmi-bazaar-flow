import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { IProductCategoryRepository } from '../interfaces/IRepository';
import { ProductCategoryData, ProductCategoryFilters } from '../models/ProductCategory';
import ProductCategoryMapper from '../mappers/ProductCategoryMapper';

class ProductCategoryRepository extends BaseRepository<ProductCategoryData, ProductCategoryFilters> implements IProductCategoryRepository {
  protected tableName = 'product_categories';

  async findById(id: string): Promise<ProductCategoryData | null> {
    const category = await this.db(this.tableName).where({ id }).first();
    if (!category) return null;
    
    const children = await this.db(this.tableName)
      .where({ parent_id: id })
      .orderBy('sort_order', 'asc');
    
    const categoryData = ProductCategoryMapper.toProductCategoryData(category);
    categoryData.children = ProductCategoryMapper.toProductCategoryDataList(children);
    
    return categoryData;
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

  async create(data: Omit<ProductCategoryData, 'id' | 'created_at' | 'updated_at'>): Promise<ProductCategoryData> {
    const dbData = ProductCategoryMapper.toDatabase(data);
    const [category] = await this.db(this.tableName)
      .insert({
        ...dbData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return ProductCategoryMapper.toProductCategoryData(category);
  }

  async update(id: string, data: Partial<ProductCategoryData>): Promise<ProductCategoryData | null> {
    const dbData = ProductCategoryMapper.toDatabase(data);
    const [category] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...dbData,
        updated_at: new Date()
      })
      .returning('*');
    
    return category ? ProductCategoryMapper.toProductCategoryData(category) : null;
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
      const categoryData = ProductCategoryMapper.toProductCategoryData(category);
      categoryData.children = [];
      categoryMap.set(category.id, categoryData);
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
