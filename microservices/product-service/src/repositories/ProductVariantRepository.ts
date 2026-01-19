// Product Variant Repository - Data access for product variants
import { Prisma, VariantStatus, ProductVariant } from '@prisma/client';
import { BaseRepository, BaseFilters } from '../common/BaseRepository';

export interface VariantFilters extends BaseFilters {
  product_id?: string;
  status?: VariantStatus;
}

class ProductVariantRepository extends BaseRepository<ProductVariant, VariantFilters> {
  protected modelName = 'ProductVariant';

  protected getModel() {
    return this.prisma.productVariant;
  }

  protected getSearchableFields(): string[] {
    return ['name', 'sku', 'barcode'];
  }

  protected getDefaultSortField(): string {
    return 'sort_order';
  }

  protected mapItem(item: any): ProductVariant {
    return item as ProductVariant;
  }

  protected buildWhereClause(filters: VariantFilters): Prisma.ProductVariantWhereInput {
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
    const searchFilter = this.applySearchFilter(filters.search);
    if (searchFilter) {
      where.OR = searchFilter.OR;
    }

    return where;
  }

  protected buildOrderBy(filters: VariantFilters): any {
    return [
      { sort_order: 'asc' },
      { name: 'asc' }
    ];
  }

  /**
   * Find variants by product ID
   */
  async findByProductId(productId: string): Promise<ProductVariant[]> {
    return this.getModel().findMany({
      where: { product_id: productId },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });
  }

  /**
   * Create variant for a specific product
   */
  async createForProduct(productId: string, data: any): Promise<ProductVariant> {
    return this.getModel().create({
      data: {
        ...data,
        product: { connect: { id: productId } }
      }
    });
  }

  /**
   * Create multiple variants at once
   */
  async createMultiple(variants: any[]): Promise<number> {
    const result = await this.getModel().createMany({
      data: variants
    });
    return result.count;
  }

  /**
   * Delete all variants for a product
   */
  async deleteByProductId(productId: string): Promise<boolean> {
    await this.getModel().deleteMany({
      where: { product_id: productId }
    });
    return true;
  }

  /**
   * Update variant stock with movement tracking
   */
  async updateStock(id: string, newStock: number, reason = ''): Promise<ProductVariant | null> {
    return this.withTransaction(async (tx) => {
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
}

export default new ProductVariantRepository();
