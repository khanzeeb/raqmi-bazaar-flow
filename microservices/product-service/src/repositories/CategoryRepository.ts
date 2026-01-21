// Category Repository - Data access for categories following VehicleRepository pattern

import { Prisma } from '@prisma/client';
import BaseRepository from './BaseRepository';
import { ICategoryRepository } from './ICategoryRepository';
import { ICategoryMapper } from '../mapper';
import { ICategoryData } from '../data';
import { ICategoryFilters } from '../filters';

export class CategoryRepository extends BaseRepository implements ICategoryRepository {
  constructor(private mapper: ICategoryMapper) {
    super();
  }

  async findAll(filters: ICategoryFilters = {}, page?: number, limit?: number): Promise<{ data: ICategoryData[]; total: number }> {
    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy();
    
    const pageNum = page ?? filters.page ?? 1;
    const limitNum = limit ?? filters.limit ?? 10;
    const offset = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        orderBy,
        skip: offset,
        take: limitNum,
        include: this.getDefaultIncludes()
      }),
      this.prisma.productCategory.count({ where })
    ]);

    return {
      data: data.map(item => this.mapper.toCategoryData(item)),
      total
    };
  }

  async findById(id: string): Promise<ICategoryData | null> {
    const data = await this.prisma.productCategory.findUnique({
      where: { id },
      include: this.getDefaultIncludes()
    });
    return data ? this.mapper.toCategoryData(data) : null;
  }

  async create(data: any): Promise<ICategoryData> {
    const dbData = this.mapper.toDatabase(data);
    const created = await this.prisma.productCategory.create({
      data: dbData,
      include: this.getDefaultIncludes()
    });
    return this.mapper.toCategoryData(created);
  }

  async update(id: string, data: any): Promise<ICategoryData | null> {
    const dbData = this.mapper.toDatabaseUpdate(data);
    const updated = await this.prisma.productCategory.update({
      where: { id },
      data: dbData,
      include: this.getDefaultIncludes()
    });
    return updated ? this.mapper.toCategoryData(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.withTransaction(async (tx) => {
      // Update children to remove parent reference
      await tx.productCategory.updateMany({
        where: { parent_id: id },
        data: { parent_id: null }
      });

      // Delete the category
      await tx.productCategory.delete({
        where: { id }
      });

      return true;
    });
  }

  async count(filters: ICategoryFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.productCategory.count({ where });
  }

  async getTree(): Promise<ICategoryData[]> {
    const categories = await this.prisma.productCategory.findMany({
      where: { status: 'active' },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });

    // Build tree structure
    const categoryMap = new Map<string, ICategoryData>();
    const tree: ICategoryData[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...this.mapper.toCategoryData(category), children: [] });
    });

    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        categoryMap.get(category.parent_id)!.children!.push(categoryWithChildren);
      } else {
        tree.push(categoryWithChildren);
      }
    });

    return tree;
  }

  // Private helpers

  private getDefaultIncludes() {
    return {
      children: {
        orderBy: [
          { sort_order: 'asc' as const },
          { name: 'asc' as const }
        ]
      }
    };
  }

  private buildWhereClause(filters: ICategoryFilters): Prisma.ProductCategoryWhereInput {
    const where: Prisma.ProductCategoryWhereInput = {};

    // Search filter
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } }
      ];
    }

    // Parent ID filter
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === '' || filters.parent_id === null) {
        where.parent_id = null;
      } else {
        where.parent_id = filters.parent_id;
      }
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  private buildOrderBy(): Prisma.ProductCategoryOrderByWithRelationInput[] {
    return [
      { sort_order: 'asc' },
      { name: 'asc' }
    ];
  }
}

export default CategoryRepository;
