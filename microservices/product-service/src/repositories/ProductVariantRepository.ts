import { Prisma, VariantStatus } from '@prisma/client';
import prisma from '../config/prisma';

export interface VariantFilters {
  page?: number;
  limit?: number;
  product_id?: string;
  status?: VariantStatus;
  search?: string;
}

class ProductVariantRepository {
  async findById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id }
    });
  }

  async findByProductId(productId: string) {
    return prisma.productVariant.findMany({
      where: { product_id: productId },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });
  }

  async findAll(filters: VariantFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
        skip,
        take: limit
      }),
      prisma.productVariant.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async count(filters: VariantFilters) {
    const where = this.buildWhereClause(filters);
    return prisma.productVariant.count({ where });
  }

  async create(data: Prisma.ProductVariantCreateInput) {
    return prisma.productVariant.create({ data });
  }

  async createForProduct(productId: string, data: any) {
    return prisma.productVariant.create({
      data: {
        ...data,
        product: { connect: { id: productId } }
      }
    });
  }

  async update(id: string, data: Prisma.ProductVariantUpdateInput) {
    return prisma.productVariant.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    try {
      await prisma.productVariant.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async createMultiple(variants: any[]) {
    return prisma.productVariant.createMany({
      data: variants
    });
  }

  async deleteByProductId(productId: string) {
    await prisma.productVariant.deleteMany({
      where: { product_id: productId }
    });
    return true;
  }

  async updateStock(id: string, newStock: number, reason = '') {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id },
        data: { stock: newStock }
      });

      await tx.stockMovement.create({
        data: {
          product_variant_id: id,
          type: 'adjustment',
          quantity: newStock,
          reason
        }
      });

      return variant;
    });
  }

  private buildWhereClause(filters: VariantFilters): Prisma.ProductVariantWhereInput {
    const where: Prisma.ProductVariantWhereInput = {};

    if (filters.product_id) {
      where.product_id = filters.product_id;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return where;
  }
}

export default new ProductVariantRepository();
