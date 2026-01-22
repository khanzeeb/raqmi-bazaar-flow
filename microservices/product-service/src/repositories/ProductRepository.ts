// Product Repository - Data access for products using Knex

import { v4 as uuid } from 'uuid';
import { BaseRepository, IPaginatedResponse } from './BaseRepository';
import { ProductMapper } from '../mapper/ProductMapper';
import { VariantMapper } from '../mapper/VariantMapper';
import type { IProductData } from '../data/IProductData';
import type { IProductFilters } from '../filters/IProductFilters';
import type { IProductRepository } from './IProductRepository';
import type { IProductMapper } from '../mapper/IProductMapper';

export class ProductRepository extends BaseRepository implements IProductRepository {
  private tableName = 'products';
  private variantTable = 'product_variants';
  private categoryTable = 'product_categories';
  private stockMovementTable = 'stock_movements';
  private mapper: IProductMapper;
  private variantMapper: VariantMapper;

  constructor(mapper: IProductMapper) {
    super();
    this.mapper = mapper;
    this.variantMapper = new VariantMapper();
  }

  async findById(id: string): Promise<IProductData | null> {
    const product = await this.db(this.tableName).where({ id }).first();
    if (!product) return null;

    // Fetch category relation
    let category_rel = undefined;
    if (product.category_id) {
      category_rel = await this.db(this.categoryTable).where({ id: product.category_id }).first();
    }

    // Fetch variants
    const variants = await this.db(this.variantTable)
      .where({ product_id: id })
      .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'name', order: 'asc' }]);

    return this.mapper.toProductData({
      ...product,
      category_rel,
      variants: variants.map((v: any) => this.variantMapper.toVariantData(v))
    });
  }

  async findAll(
    filters: IProductFilters = {},
    page = 1,
    limit = 10
  ): Promise<IPaginatedResponse<IProductData>> {
    let query = this.db(this.tableName).select(`${this.tableName}.*`);

    // Apply search filter
    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.where(function () {
        this.orWhereILike(`${this.tableName || 'products'}.name`, term);
        this.orWhereILike(`${this.tableName || 'products'}.sku`, term);
        this.orWhereILike(`${this.tableName || 'products'}.description`, term);
      });
    }

    // Apply category filter
    if (filters.category_id) {
      query = query.where('category_id', filters.category_id);
    } else if (filters.category) {
      query = query
        .leftJoin(this.categoryTable, `${this.tableName}.category_id`, `${this.categoryTable}.id`)
        .where(`${this.categoryTable}.name`, filters.category);
    }

    // Apply status filter
    if (filters.status) {
      query = query.where(`${this.tableName}.status`, filters.status);
    }

    // Apply stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          query = query.where(`${this.tableName}.stock`, '<=', 0);
          break;
        case 'low-stock':
          query = query.where(`${this.tableName}.stock`, '>', 0).where(`${this.tableName}.stock`, '<=', 10);
          break;
        case 'in-stock':
          query = query.where(`${this.tableName}.stock`, '>', 0);
          break;
      }
    }

    // Apply price range filter
    if (filters.priceRange) {
      query = query
        .where(`${this.tableName}.price`, '>=', filters.priceRange.min)
        .where(`${this.tableName}.price`, '<=', filters.priceRange.max);
    }

    // Apply supplier filter
    if (filters.supplier) {
      query = query.where(`${this.tableName}.supplier`, filters.supplier);
    }

    // Count total
    const countResult = await query.clone().clearSelect().count('* as total').first();
    const total = countResult?.total ? parseInt(countResult.total.toString()) : 0;

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.orderBy(`${this.tableName}.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    const products = await query.limit(limit).offset(offset);

    // Fetch related data for each product
    const productIds = products.map((p: any) => p.id);
    const variants = productIds.length
      ? await this.db(this.variantTable).whereIn('product_id', productIds).orderBy('sort_order', 'asc')
      : [];
    const categoryIds = [...new Set(products.map((p: any) => p.category_id).filter(Boolean))];
    const categories = categoryIds.length
      ? await this.db(this.categoryTable).whereIn('id', categoryIds as string[])
      : [];

    const variantMap = new Map<string, any[]>();
    variants.forEach((v: any) => {
      const list = variantMap.get(v.product_id) || [];
      list.push(this.variantMapper.toVariantData(v));
      variantMap.set(v.product_id, list);
    });

    const categoryMap = new Map<string, any>();
    categories.forEach((c: any) => categoryMap.set(c.id, c));

    const data = products.map((p: any) =>
      this.mapper.toProductData({
        ...p,
        category_rel: p.category_id ? categoryMap.get(p.category_id) : undefined,
        variants: variantMap.get(p.id) || []
      })
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByIds(ids: string[]): Promise<IProductData[]> {
    if (!ids.length) return [];

    const products = await this.db(this.tableName).whereIn('id', ids);
    const variants = await this.db(this.variantTable).whereIn('product_id', ids).orderBy('sort_order', 'asc');

    const variantMap = new Map<string, any[]>();
    variants.forEach((v: any) => {
      const list = variantMap.get(v.product_id) || [];
      list.push(this.variantMapper.toVariantData(v));
      variantMap.set(v.product_id, list);
    });

    return products.map((p: any) =>
      this.mapper.toProductData({
        ...p,
        variants: variantMap.get(p.id) || []
      })
    );
  }

  async create(data: any): Promise<IProductData> {
    const dbData = this.mapper.toDatabase(data);
    const dataWithTimestamps = this.setTimestamps({ ...dbData, id: uuid() });

    const [product] = await this.db(this.tableName).insert(dataWithTimestamps).returning('*');
    return this.mapper.toProductData(product);
  }

  async createWithVariants(productData: any, variants?: any[]): Promise<IProductData> {
    return this.withTransaction(async (trx) => {
      const dbData = this.mapper.toDatabase(productData);
      const productId = uuid();
      const dataWithTimestamps = this.setTimestamps({ ...dbData, id: productId });

      const [product] = await trx(this.tableName).insert(dataWithTimestamps).returning('*');

      let variantRecords: any[] = [];
      if (variants?.length) {
        const variantData = variants.map((v) => ({
          ...this.variantMapper.toDatabase(v),
          id: uuid(),
          product_id: productId,
          created_at: new Date(),
          updated_at: new Date()
        }));
        variantRecords = await trx(this.variantTable).insert(variantData).returning('*');
      }

      return this.mapper.toProductData({
        ...product,
        variants: variantRecords.map((v: any) => this.variantMapper.toVariantData(v))
      });
    });
  }

  async update(id: string, data: any): Promise<IProductData | null> {
    const dbData = this.mapper.toDatabase(data);
    const dataWithTimestamps = this.setTimestamps(dbData, true);

    const [updated] = await this.db(this.tableName)
      .where({ id })
      .update(dataWithTimestamps)
      .returning('*');

    if (!updated) return null;
    return this.findById(id);
  }

  async updateWithVariants(id: string, productData: any, variants?: any[]): Promise<IProductData | null> {
    return this.withTransaction(async (trx) => {
      const dbData = this.mapper.toDatabase(productData);
      const dataWithTimestamps = this.setTimestamps(dbData, true);

      const [updated] = await trx(this.tableName)
        .where({ id })
        .update(dataWithTimestamps)
        .returning('*');

      if (!updated) return null;

      if (variants !== undefined) {
        await trx(this.variantTable).where({ product_id: id }).delete();

        if (variants.length > 0) {
          const variantData = variants.map((v) => ({
            ...this.variantMapper.toDatabase(v),
            id: uuid(),
            product_id: id,
            created_at: new Date(),
            updated_at: new Date()
          }));
          await trx(this.variantTable).insert(variantData);
        }
      }

      // Fetch the updated product with variants
      const product = await trx(this.tableName).where({ id }).first();
      const updatedVariants = await trx(this.variantTable)
        .where({ product_id: id })
        .orderBy('sort_order', 'asc');

      return this.mapper.toProductData({
        ...product,
        variants: updatedVariants.map((v: any) => this.variantMapper.toVariantData(v))
      });
    });
  }

  async updateStock(id: string, newStock: number, reason = ''): Promise<IProductData | null> {
    return this.withTransaction(async (trx) => {
      const [updated] = await trx(this.tableName)
        .where({ id })
        .update({ stock: newStock, updated_at: new Date() })
        .returning('*');

      if (!updated) return null;

      await trx(this.stockMovementTable).insert({
        id: uuid(),
        product_id: id,
        type: 'adjustment',
        quantity: newStock,
        reason,
        created_at: new Date()
      });

      const variants = await trx(this.variantTable)
        .where({ product_id: id })
        .orderBy('sort_order', 'asc');

      return this.mapper.toProductData({
        ...updated,
        variants: variants.map((v: any) => this.variantMapper.toVariantData(v))
      });
    });
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ id }).delete();
    return deletedCount > 0;
  }

  async count(filters: IProductFilters = {}): Promise<number> {
    let query = this.db(this.tableName);

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          query = query.where('stock', '<=', 0);
          break;
        case 'low-stock':
          query = query.where('stock', '>', 0).where('stock', '<=', 10);
          break;
        case 'in-stock':
          query = query.where('stock', '>', 0);
          break;
      }
    }

    const result = await query.count('* as total').first();
    return result?.total ? parseInt(result.total.toString()) : 0;
  }

  async getCategories(): Promise<string[]> {
    const result = await this.db(this.tableName)
      .whereNotNull('category')
      .distinct('category')
      .orderBy('category', 'asc');

    return result.map((r: any) => r.category).filter(Boolean);
  }

  async getSuppliers(): Promise<string[]> {
    const result = await this.db(this.tableName)
      .whereNotNull('supplier')
      .distinct('supplier')
      .orderBy('supplier', 'asc');

    return result.map((r: any) => r.supplier).filter(Boolean);
  }
}

// Create default instance with ProductMapper
export default new ProductRepository(new ProductMapper());
