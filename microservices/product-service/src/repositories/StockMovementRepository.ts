// Stock Movement Repository - Data access for stock movements
import { Prisma, MovementType, StockMovement } from '@prisma/client';
import { BaseRepository, BaseFilters } from '../common/BaseRepository';

export interface StockMovementFilters extends BaseFilters {
  product_id?: string;
  product_variant_id?: string;
  type?: MovementType;
  start_date?: string;
  end_date?: string;
}

class StockMovementRepository extends BaseRepository<StockMovement, StockMovementFilters> {
  protected modelName = 'StockMovement';

  protected getModel() {
    return this.prisma.stockMovement;
  }

  protected getSearchableFields(): string[] {
    return ['reason'];
  }

  protected getDefaultSortField(): string {
    return 'created_at';
  }

  protected mapItem(item: any): StockMovement {
    return item as StockMovement;
  }

  protected getDefaultIncludes(): any {
    return {
      product: {
        select: { id: true, name: true, sku: true }
      },
      product_variant: {
        select: { id: true, name: true, sku: true }
      }
    };
  }

  protected buildWhereClause(filters: StockMovementFilters): Prisma.StockMovementWhereInput {
    const where: Prisma.StockMovementWhereInput = {};

    // Product ID filter
    if (filters.product_id) {
      where.product_id = filters.product_id;
    }

    // Product Variant ID filter
    if (filters.product_variant_id) {
      where.product_variant_id = filters.product_variant_id;
    }

    // Movement type filter
    if (filters.type) {
      where.type = filters.type;
    }

    // Date range filter
    if (filters.start_date || filters.end_date) {
      where.created_at = {};
      if (filters.start_date) {
        where.created_at.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.created_at.lte = new Date(filters.end_date);
      }
    }

    // Search filter
    const searchFilter = this.applySearchFilter(filters.search);
    if (searchFilter) {
      where.OR = searchFilter.OR;
    }

    return where;
  }

  /**
   * Find movements by product ID
   */
  async findByProductId(productId: string): Promise<StockMovement[]> {
    return this.getModel().findMany({
      where: { product_id: productId },
      include: this.getDefaultIncludes(),
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Find movements by variant ID
   */
  async findByVariantId(variantId: string): Promise<StockMovement[]> {
    return this.getModel().findMany({
      where: { product_variant_id: variantId },
      include: this.getDefaultIncludes(),
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Create stock movement for product
   */
  async createForProduct(productId: string, type: MovementType, quantity: number, reason?: string): Promise<StockMovement> {
    return this.create({
      product_id: productId,
      type,
      quantity,
      reason
    });
  }

  /**
   * Create stock movement for variant
   */
  async createForVariant(variantId: string, type: MovementType, quantity: number, reason?: string): Promise<StockMovement> {
    return this.create({
      product_variant_id: variantId,
      type,
      quantity,
      reason
    });
  }

  /**
   * Get movement summary by type for a product
   */
  async getMovementSummary(productId: string): Promise<{ type: MovementType; total: number }[]> {
    const result = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: { product_id: productId },
      _sum: { quantity: true }
    });

    return result.map(item => ({
      type: item.type,
      total: item._sum.quantity || 0
    }));
  }

  /**
   * Get recent movements across all products
   */
  async getRecentMovements(limit = 20): Promise<StockMovement[]> {
    return this.getModel().findMany({
      include: this.getDefaultIncludes(),
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }
}

export default new StockMovementRepository();
