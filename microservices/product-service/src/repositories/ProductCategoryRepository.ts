import { Prisma, CategoryStatus } from '@prisma/client';
import prisma from '../config/prisma';

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  parent_id?: string;
  status?: CategoryStatus;
}

class ProductCategoryRepository {
  async findById(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
        }
      }
    });

    return category;
  }

  async findAll(filters: CategoryFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
        skip,
        take: limit
      }),
      prisma.productCategory.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async count(filters: CategoryFilters) {
    const where = this.buildWhereClause(filters);
    return prisma.productCategory.count({ where });
  }

  async create(data: Prisma.ProductCategoryCreateInput) {
    return prisma.productCategory.create({ data });
  }

  async update(id: string, data: Prisma.ProductCategoryUpdateInput) {
    return prisma.productCategory.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
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

  async getTree() {
    const categories = await prisma.productCategory.findMany({
      where: { status: 'active' },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });

    // Build tree structure
    const categoryMap = new Map();
    const tree: any[] = [];

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

  private buildWhereClause(filters: CategoryFilters): Prisma.ProductCategoryWhereInput {
    const where: Prisma.ProductCategoryWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === '' || filters.parent_id === null) {
        where.parent_id = null;
      } else {
        where.parent_id = filters.parent_id;
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}

export default new ProductCategoryRepository();
