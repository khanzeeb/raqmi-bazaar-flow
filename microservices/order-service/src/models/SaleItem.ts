import { BaseRepository } from '../common/BaseRepository';

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  line_total: number;
  created_at: Date;
  updated_at: Date;
}

export interface SaleItemFilters {
  sale_id?: string;
  product_id?: string;
}

export class SaleItemRepository extends BaseRepository<SaleItem, SaleItemFilters> {
  protected tableName = 'sale_items';

  protected buildFindAllQuery(filters: SaleItemFilters) {
    let query = this.db(this.tableName)
      .leftJoin('products', 'sale_items.product_id', 'products.id')
      .select(
        'sale_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      );

    if (filters.sale_id) {
      query = query.where('sale_items.sale_id', filters.sale_id);
    }

    if (filters.product_id) {
      query = query.where('sale_items.product_id', filters.product_id);
    }

    return query.orderBy('sale_items.id');
  }

  protected buildCountQuery(filters: SaleItemFilters) {
    let query = this.db(this.tableName).count('id as count');

    if (filters.sale_id) {
      query = query.where('sale_id', filters.sale_id);
    }

    if (filters.product_id) {
      query = query.where('product_id', filters.product_id);
    }

    return query;
  }

  async findBySaleId(saleId: string): Promise<SaleItem[]> {
    return await this.db(this.tableName)
      .leftJoin('products', 'sale_items.product_id', 'products.id')
      .select(
        'sale_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .where('sale_items.sale_id', saleId)
      .orderBy('sale_items.id');
  }

  async createBulk(saleId: string, items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at' | 'updated_at'>[]): Promise<SaleItem[]> {
    const trx = await this.db.transaction();
    
    try {
      // Delete existing items for this sale
      await trx(this.tableName).where({ sale_id: saleId }).del();
      
      // Insert new items
      const itemsData = items.map(item => ({
        ...item,
        sale_id: saleId,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const newItems = await trx(this.tableName)
        .insert(itemsData)
        .returning('*');
      
      await trx.commit();
      return newItems;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async deleteBySaleId(saleId: string): Promise<boolean> {
    const result = await this.db(this.tableName).where({ sale_id: saleId }).del();
    return result > 0;
  }

  static calculateLineTotal(quantity: number, unitPrice: number, discountAmount = 0, taxAmount = 0): number {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }

  async getSaleItemStats(saleId: string): Promise<any> {
    const stats = await this.db(this.tableName)
      .where({ sale_id: saleId })
      .select(
        this.db.raw('COUNT(*) as total_items'),
        this.db.raw('SUM(quantity) as total_quantity'),
        this.db.raw('SUM(line_total) as total_amount'),
        this.db.raw('SUM(discount_amount) as total_discount'),
        this.db.raw('SUM(tax_amount) as total_tax')
      )
      .first();
    
    return stats;
  }
}