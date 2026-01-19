// Product Repository - Data access for products
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseRepository, BaseFilters } from '../common/BaseRepository';
import { ProductMapper } from '../mappers/ProductMapper';
import { IProductData, IProductFilters, IPaginatedResponse } from '../interfaces/IProduct';

class ProductRepository extends BaseRepository<IProductData, IProductFilters> {
  protected modelName = 'Product';
  private mapper: ProductMapper;

  constructor() {
    super();
    this.mapper = new ProductMapper();
  }

  protected getModel() {
    return this.prisma.product;
  }

  protected getDefaultIncludes() {
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

  protected getSearchableFields(): string[] {
    return ['name', 'sku', 'description'];
  }

  protected mapItem(item: any): IProductData {
    return this.mapper.toProductData(item);
  }

  protected buildWhereClause(filters: IProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    // Search filter
    if (filters.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category_rel: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    // Category filters
    if (filters.category_id) {
      where.category_id = filters.category_id;
    } else if (filters.category) {
      where.category_rel = { name: filters.category };
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          where.stock = { lte: 0 };
          break;
        case 'low-stock':
          where.stock = { gt: 0, lte: 10 };
          break;
        case 'in-stock':
          where.stock = { gt: 0 };
          break;
      }
    }

    // Price range filter
    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max
      };
    }

    // Supplier filter
    if (filters.supplier) {
      where.supplier = filters.supplier;
    }

    return where;
  }

  /**
   * Find products by IDs
   */
  async findByIds(ids: string[]): Promise<IProductData[]> {
    const products = await this.getModel().findMany({
      where: { id: { in: ids } },
      include: this.getDefaultIncludes()
    });
    return products.map((p: any) => this.mapItem(p));
  }

  /**
   * Create product with variants (transaction)
   */
  async createWithVariants(productData: any, variants?: any[]): Promise<IProductData> {
    const product = await this.withTransaction(async (tx) => {
      return tx.product.create({
        data: {
          ...productData,
          variants: variants?.length ? { create: variants } : undefined
        },
        include: this.getDefaultIncludes()
      });
    });
    return this.mapItem(product);
  }

  /**
   * Update product with variants (transaction)
   */
  async updateWithVariants(id: string, productData: any, variants?: any[]): Promise<IProductData | null> {
    try {
      const product = await this.withTransaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: productData
        });

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
          include: this.getDefaultIncludes()
        });
      });

      return product ? this.mapItem(product) : null;
    } catch {
      return null;
    }
  }

  /**
   * Update stock with movement tracking (transaction)
   */
  async updateStock(id: string, newStock: number, reason = ''): Promise<IProductData | null> {
    try {
      const product = await this.withTransaction(async (tx) => {
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
          include: this.getDefaultIncludes()
        });
      });

      return product ? this.mapItem(product) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get distinct categories
   */
  async getCategories(): Promise<string[]> {
    const result = await this.getModel().findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    return result.map((r: any) => r.category).filter(Boolean) as string[];
  }

  /**
   * Get distinct suppliers
   */
  async getSuppliers(): Promise<string[]> {
    const result = await this.getModel().findMany({
      where: { supplier: { not: null } },
      select: { supplier: true },
      distinct: ['supplier'],
      orderBy: { supplier: 'asc' }
    });
    return result.map((r: any) => r.supplier).filter(Boolean) as string[];
  }
}

export default new ProductRepository();
