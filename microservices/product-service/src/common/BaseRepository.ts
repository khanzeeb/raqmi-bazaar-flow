// Base Repository - Common data access patterns with Prisma
import { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { IPaginatedResponse } from '../interfaces/IProduct';

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export abstract class BaseRepository<T, TFilters extends BaseFilters = BaseFilters> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get model delegate - override in subclass
   */
  protected abstract getModel(): any;

  /**
   * Default includes for queries - override in subclass
   */
  protected getDefaultIncludes(): any {
    return undefined;
  }

  /**
   * Build where clause from filters - override in subclass
   */
  protected abstract buildWhereClause(filters: TFilters): any;

  /**
   * Map database item to domain object - override in subclass
   */
  protected abstract mapItem(item: any): T;

  /**
   * Get default sort field
   */
  protected getDefaultSortField(): string {
    return 'created_at';
  }

  /**
   * Get searchable fields for full-text search
   */
  protected getSearchableFields(): string[] {
    return ['name'];
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    const item = await this.getModel().findUnique({
      where: { id },
      include: this.getDefaultIncludes()
    });
    return item ? this.mapItem(item) : null;
  }

  /**
   * Find all with pagination and filters
   */
  async findAll(filters: TFilters): Promise<IPaginatedResponse<T>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy(filters);

    const [data, total] = await Promise.all([
      this.getModel().findMany({
        where,
        include: this.getDefaultIncludes(),
        orderBy,
        skip,
        take: limit
      }),
      this.getModel().count({ where })
    ]);

    return {
      data: data.map((item: any) => this.mapItem(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Count with filters
   */
  async count(filters: TFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.getModel().count({ where });
  }

  /**
   * Create entity
   */
  async create(data: any): Promise<T> {
    const item = await this.getModel().create({
      data,
      include: this.getDefaultIncludes()
    });
    return this.mapItem(item);
  }

  /**
   * Update entity
   */
  async update(id: string, data: any): Promise<T | null> {
    try {
      const item = await this.getModel().update({
        where: { id },
        data,
        include: this.getDefaultIncludes()
      });
      return this.mapItem(item);
    } catch {
      return null;
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.getModel().delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Build order by from filters
   */
  protected buildOrderBy(filters: TFilters): any {
    const sortBy = filters.sortBy || this.getDefaultSortField();
    const sortOrder = filters.sortOrder || 'desc';
    return { [sortBy]: sortOrder };
  }

  /**
   * Apply search filter helper
   */
  protected applySearchFilter(search?: string): any {
    if (!search?.trim()) return undefined;

    const fields = this.getSearchableFields();
    if (fields.length === 0) return undefined;

    return {
      OR: fields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }))
    };
  }

  /**
   * Execute in transaction
   */
  protected async withTransaction<R>(
    callback: (tx: any) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(callback);
  }
}
