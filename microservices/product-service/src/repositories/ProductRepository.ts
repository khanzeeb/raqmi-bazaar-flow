// Product Repository - Single Responsibility: Data access only

import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { ProductQueryBuilder } from '../query-builders/ProductQueryBuilder';
import { ProductMapper } from '../mappers/ProductMapper';
import { IProductData, IProductFilters, IPaginatedResponse } from '../interfaces/IProduct';
import { IProductRepository } from '../interfaces/IRepository';

class ProductRepository implements IProductRepository<IProductData, IProductFilters> {
  private queryBuilder: ProductQueryBuilder;
  private mapper: ProductMapper;

  constructor() {
    this.queryBuilder = new ProductQueryBuilder();
    this.mapper = new ProductMapper();
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<IProductData | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: this.queryBuilder.withRelations()
    });
    return product ? this.mapper.toProductData(product) : null;
  }

  /**
   * Find products by IDs
   */
  async findByIds(ids: string[]): Promise<IProductData[]> {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: this.queryBuilder.withRelations()
    });
    return products.map(p => this.mapper.toProductData(p));
  }

  /**
   * Find all products with filters
   */
  async findAll(filters: IProductFilters): Promise<IPaginatedResponse<IProductData>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    return this.queryBuilder
      .reset()
      .executePaginated({ page, limit }, filters);
  }

  /**
   * Count products with filters
   */
  async count(filters: IProductFilters): Promise<number> {
    return this.queryBuilder
      .reset()
      .executeCount(filters);
  }

  /**
   * Create product
   */
  async create(data: Prisma.ProductCreateInput): Promise<IProductData> {
    const product = await prisma.product.create({
      data,
      include: this.queryBuilder.withRelations()
    });
    return this.mapper.toProductData(product);
  }

  /**
   * Create product with variants (transaction)
   */
  async createWithVariants(productData: any, variants?: any[]): Promise<IProductData> {
    const product = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          ...productData,
          variants: variants?.length ? { create: variants } : undefined
        },
        include: this.queryBuilder.withRelations()
      });
    });
    return this.mapper.toProductData(product);
  }

  /**
   * Update product
   */
  async update(id: string, data: Prisma.ProductUpdateInput): Promise<IProductData | null> {
    try {
      const product = await prisma.product.update({
        where: { id },
        data,
        include: this.queryBuilder.withRelations()
      });
      return this.mapper.toProductData(product);
    } catch {
      return null;
    }
  }

  /**
   * Update product with variants (transaction)
   */
  async updateWithVariants(id: string, productData: any, variants?: any[]): Promise<IProductData | null> {
    try {
      const product = await prisma.$transaction(async (tx) => {
        // Update product
        await tx.product.update({
          where: { id },
          data: productData
        });

        // Handle variants if provided
        if (variants !== undefined) {
          await tx.productVariant.deleteMany({ where: { product_id: id } });
          
          if (variants.length > 0) {
            await tx.productVariant.createMany({
              data: variants.map(v => ({ ...v, product_id: id }))
            });
          }
        }

        return tx.product.findUnique({
          where: { id },
          include: this.queryBuilder.withRelations()
        });
      });

      return product ? this.mapper.toProductData(product) : null;
    } catch {
      return null;
    }
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update stock with movement tracking (transaction)
   */
  async updateStock(id: string, newStock: number, reason = ''): Promise<IProductData | null> {
    try {
      const product = await prisma.$transaction(async (tx) => {
        await tx.product.update({
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
          include: this.queryBuilder.withRelations()
        });
      });

      return product ? this.mapper.toProductData(product) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get distinct categories
   */
  async getCategories(): Promise<string[]> {
    const result = await prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    return result.map(r => r.category).filter(Boolean) as string[];
  }

  /**
   * Get distinct suppliers
   */
  async getSuppliers(): Promise<string[]> {
    const result = await prisma.product.findMany({
      where: { supplier: { not: null } },
      select: { supplier: true },
      distinct: ['supplier'],
      orderBy: { supplier: 'asc' }
    });
    return result.map(r => r.supplier).filter(Boolean) as string[];
  }
}

export default new ProductRepository();
