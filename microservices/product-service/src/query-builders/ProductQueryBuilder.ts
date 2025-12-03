// Product Query Builder - Single Responsibility: Product-specific query building

import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { BaseQueryBuilder } from './BaseQueryBuilder';
import { ProductMapper } from '../mappers/ProductMapper';
import { IProductData, IProductFilters, IPaginatedResponse, IPaginationOptions } from '../interfaces/IProduct';

export class ProductQueryBuilder extends BaseQueryBuilder<IProductData, IProductFilters> {
  private mapper: ProductMapper;
  private whereClause: Prisma.ProductWhereInput = {};

  constructor() {
    super('Product');
    this.mapper = new ProductMapper();
  }

  /**
   * Include category and variants relations
   */
  withRelations() {
    return {
      category_rel: true,
      variants: {
        orderBy: [
          { sort_order: 'asc' as const },
          { name: 'asc' as const }
        ]
      }
    };
  }

  /**
   * Apply search filter across product fields
   */
  applySearchFilter(searchTerm?: string): this {
    if (!searchTerm?.trim()) return this;

    this.whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { category_rel: { name: { contains: searchTerm, mode: 'insensitive' } } }
    ];
    return this;
  }

  /**
   * Filter by category ID
   */
  filterByCategoryId(categoryId?: string): this {
    if (categoryId) {
      this.whereClause.category_id = categoryId;
    }
    return this;
  }

  /**
   * Filter by category name
   */
  filterByCategory(category?: string): this {
    if (category && !this.whereClause.category_id) {
      this.whereClause.category_rel = { name: category };
    }
    return this;
  }

  /**
   * Filter by status
   */
  filterByStatus(status?: string): this {
    if (status) {
      this.whereClause.status = status as any;
    }
    return this;
  }

  /**
   * Filter by stock status
   */
  filterByStockStatus(stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock'): this {
    if (!stockStatus) return this;

    switch (stockStatus) {
      case 'out-of-stock':
        this.whereClause.stock = { lte: 0 };
        break;
      case 'low-stock':
        this.whereClause.AND = [
          { stock: { gt: 0 } },
          // Compare stock to min_stock using raw condition
        ];
        this.whereClause.stock = { gt: 0, lte: 10 }; // Simplified for now
        break;
      case 'in-stock':
        this.whereClause.stock = { gt: 0 };
        break;
    }
    return this;
  }

  /**
   * Filter by price range
   */
  filterByPriceRange(priceRange?: { min: number; max: number }): this {
    if (priceRange) {
      this.whereClause.price = {
        gte: priceRange.min,
        lte: priceRange.max
      };
    }
    return this;
  }

  /**
   * Filter by supplier
   */
  filterBySupplier(supplier?: string): this {
    if (supplier) {
      this.whereClause.supplier = supplier;
    }
    return this;
  }

  /**
   * Apply all filters at once (Fluent interface pattern)
   */
  applyFilters(filters: IProductFilters): this {
    this.whereClause = {}; // Reset
    return this
      .applySearchFilter(filters.search)
      .filterByCategoryId(filters.category_id)
      .filterByCategory(filters.category)
      .filterByStatus(filters.status)
      .filterByStockStatus(filters.stockStatus)
      .filterByPriceRange(filters.priceRange)
      .filterBySupplier(filters.supplier);
  }

  /**
   * Build where clause from current state
   */
  buildWhereClause(filters: IProductFilters): Prisma.ProductWhereInput {
    this.applyFilters(filters);
    return this.whereClause;
  }

  /**
   * Build order by clause
   */
  buildOrderBy(filters: IProductFilters): Prisma.ProductOrderByWithRelationInput {
    const sortBy = filters.sortBy || this.getDefaultOrderBy();
    const sortOrder = filters.sortOrder || 'desc';
    return { [sortBy]: sortOrder };
  }

  /**
   * Get default order by field
   */
  getDefaultOrderBy(): string {
    return 'created_at';
  }

  /**
   * Map database item to product data
   */
  mapItem(item: any): IProductData {
    return this.mapper.toProductData(item);
  }

  /**
   * Execute paginated query
   */
  async executePaginated(options: IPaginationOptions, filters: IProductFilters): Promise<IPaginatedResponse<IProductData>> {
    const skip = this.calculateSkip(options.page, options.limit);
    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy(filters);

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: this.withRelations(),
        orderBy,
        skip,
        take: options.limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: data.map(item => this.mapItem(item)),
      ...this.calculatePagination(total, options.page, options.limit)
    };
  }

  /**
   * Execute count query
   */
  async executeCount(filters: IProductFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.product.count({ where });
  }

  /**
   * Reset builder state
   */
  reset(): this {
    this.whereClause = {};
    return this;
  }
}
