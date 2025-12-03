// Base Query Builder - Single Responsibility: Abstract query building logic

import { IPaginatedResponse, IPaginationOptions } from '../interfaces/IProduct';

export abstract class BaseQueryBuilder<TData, TFilters> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Apply search filter - to be implemented by subclasses
   */
  abstract applySearchFilter(searchTerm?: string): this;

  /**
   * Apply all filters - to be implemented by subclasses
   */
  abstract applyFilters(filters: TFilters): this;

  /**
   * Get default order by field - to be implemented by subclasses
   */
  abstract getDefaultOrderBy(): string;

  /**
   * Map database row to data object - to be implemented by subclasses
   */
  abstract mapItem(item: any): TData;

  /**
   * Build where clause from filters - to be implemented by subclasses
   */
  abstract buildWhereClause(filters: TFilters): any;

  /**
   * Build order by clause - to be implemented by subclasses
   */
  abstract buildOrderBy(filters: TFilters): any;

  /**
   * Execute paginated query - to be implemented by subclasses
   */
  abstract executePaginated(options: IPaginationOptions, filters: TFilters): Promise<IPaginatedResponse<TData>>;

  /**
   * Execute count query - to be implemented by subclasses
   */
  abstract executeCount(filters: TFilters): Promise<number>;

  /**
   * Calculate pagination metadata
   */
  protected calculatePagination(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Calculate skip/offset for pagination
   */
  protected calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
