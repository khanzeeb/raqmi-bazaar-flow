import { Prisma, ProductStatus } from '@prisma/client';
import prisma from '../config/prisma';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  category_id?: string;
  status?: ProductStatus;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  priceRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
}

class ProductRepository {
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category_rel: true,
        variants: {
          orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
        }
      }
    });
  }

  async findByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        category_rel: true,
        variants: true
      }
    });
  }

  async findAll(filters: ProductFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy(filters);

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category_rel: true,
          variants: {
            orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async count(filters: ProductFilters) {
    const where = this.buildWhereClause(filters);
    return prisma.product.count({ where });
  }

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category_rel: true,
        variants: true
      }
    });
  }

  async createWithVariants(productData: any, variants?: any[]) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          variants: variants && variants.length > 0 ? {
            create: variants
          } : undefined
        },
        include: {
          category_rel: true,
          variants: true
        }
      });

      return product;
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category_rel: true,
        variants: true
      }
    });
  }

  async updateWithVariants(id: string, productData: any, variants?: any[]) {
    return prisma.$transaction(async (tx) => {
      // Update product
      const product = await tx.product.update({
        where: { id },
        data: productData
      });

      // Handle variants if provided
      if (variants !== undefined) {
        // Delete existing variants
        await tx.productVariant.deleteMany({
          where: { product_id: id }
        });

        // Create new variants
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map(variant => ({
              ...variant,
              product_id: id
            }))
          });
        }
      }

      // Return updated product with variants
      return tx.product.findUnique({
        where: { id },
        include: {
          category_rel: true,
          variants: true
        }
      });
    });
  }

  async delete(id: string) {
    try {
      await prisma.product.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateStock(id: string, newStock: number, reason = '') {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: { stock: newStock }
      });

      await tx.stockMovement.create({
        data: {
          product_id: id,
          type: 'adjustment',
          quantity: newStock,
          reason
        }
      });

      return tx.product.findUnique({
        where: { id },
        include: {
          category_rel: true,
          variants: true
        }
      });
    });
  }

  async getCategories() {
    const result = await prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    return result.map(r => r.category).filter(Boolean) as string[];
  }

  async getSuppliers() {
    const result = await prisma.product.findMany({
      where: { supplier: { not: null } },
      select: { supplier: true },
      distinct: ['supplier'],
      orderBy: { supplier: 'asc' }
    });

    return result.map(r => r.supplier).filter(Boolean) as string[];
  }

  private buildWhereClause(filters: ProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category_rel: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    if (filters.category_id) {
      where.category_id = filters.category_id;
    } else if (filters.category) {
      where.category_rel = { name: filters.category };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          where.stock = { lte: 0 };
          break;
        case 'low-stock':
          where.AND = [
            { stock: { gt: 0 } },
            { stock: { lte: prisma.product.fields.min_stock as any } }
          ];
          // Use raw query for complex comparison
          where.stock = { gt: 0 };
          break;
        case 'in-stock':
          where.stock = { gt: 0 };
          break;
      }
    }

    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max
      };
    }

    if (filters.supplier) {
      where.supplier = filters.supplier;
    }

    return where;
  }

  private buildOrderBy(filters: ProductFilters): Prisma.ProductOrderByWithRelationInput {
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';

    return { [sortBy]: sortOrder };
  }
}

export default new ProductRepository();
