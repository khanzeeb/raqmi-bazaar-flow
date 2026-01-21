// Variant Repository - Data access for product variants following VehicleRepository pattern

import { Prisma } from '@prisma/client';
import BaseRepository from './BaseRepository';
import { IVariantRepository } from './IVariantRepository';
import { IVariantMapper } from '../mapper';
import { IProductVariantData } from '../data';
import { IVariantFilters } from '../filters';

export class VariantRepository extends BaseRepository implements IVariantRepository {
  constructor(private mapper: IVariantMapper) {
    super();
  }

  async findAll(filters: IVariantFilters = {}, page?: number, limit?: number): Promise<{ data: IProductVariantData[]; total: number }> {
    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy();
    
    const pageNum = page ?? filters.page ?? 1;
    const limitNum = limit ?? filters.limit ?? 10;
    const offset = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.prisma.productVariant.findMany({
        where,
        orderBy,
        skip: offset,
        take: limitNum
      }),
      this.prisma.productVariant.count({ where })
    ]);

    return {
      data: data.map(item => this.mapper.toVariantData(item)),
      total
    };
  }

  async findById(id: string): Promise<IProductVariantData | null> {
    const data = await this.prisma.productVariant.findUnique({
      where: { id }
    });
    return data ? this.mapper.toVariantData(data) : null;
  }

  async findByProductId(productId: string): Promise<IProductVariantData[]> {
    const data = await this.prisma.productVariant.findMany({
      where: { product_id: productId },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });
    return data.map(item => this.mapper.toVariantData(item));
  }

  async create(data: any): Promise<IProductVariantData> {
    const dbData = this.mapper.toDatabase(data);
    const created = await this.prisma.productVariant.create({
      data: dbData
    });
    return this.mapper.toVariantData(created);
  }

  async createForProduct(productId: string, data: any): Promise<IProductVariantData> {
    const dbData = this.mapper.toDatabase(data);
    const created = await this.prisma.productVariant.create({
      data: {
        ...dbData,
        product: { connect: { id: productId } }
      }
    });
    return this.mapper.toVariantData(created);
  }

  async createMultiple(variants: any[]): Promise<number> {
    const result = await this.prisma.productVariant.createMany({
      data: variants.map(v => this.mapper.toDatabase(v))
    });
    return result.count;
  }

  async update(id: string, data: any): Promise<IProductVariantData | null> {
    const dbData = this.mapper.toDatabaseUpdate(data);
    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: dbData
    });
    return updated ? this.mapper.toVariantData(updated) : null;
  }

  async updateStock(id: string, newStock: number, reason = ''): Promise<IProductVariantData | null> {
    return this.withTransaction(async (tx) => {
      const updated = await tx.productVariant.update({
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

      return updated ? this.mapper.toVariantData(updated) : null;
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.productVariant.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    await this.prisma.productVariant.deleteMany({
      where: { product_id: productId }
    });
    return true;
  }

  async count(filters: IVariantFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.productVariant.count({ where });
  }

  // Private helpers

  private buildWhereClause(filters: IVariantFilters): Prisma.ProductVariantWhereInput {
    const where: Prisma.ProductVariantWhereInput = {};

    // Product ID filter
    if (filters.product_id) {
      where.product_id = filters.product_id;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Search filter
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { barcode: { contains: term, mode: 'insensitive' } }
      ];
    }

    return where;
  }

  private buildOrderBy(): Prisma.ProductVariantOrderByWithRelationInput[] {
    return [
      { sort_order: 'asc' },
      { name: 'asc' }
    ];
  }
}

export default VariantRepository;
