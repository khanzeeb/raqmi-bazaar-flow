import { BaseRepository } from '../common/BaseRepository';

export interface ReturnItem {
  id: string;
  return_id: string;
  sale_item_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity_returned: number;
  original_quantity: number;
  unit_price: number;
  line_total: number;
  condition: 'good' | 'damaged' | 'defective' | 'unopened';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReturnItemFilters {
  return_id?: string;
  sale_item_id?: string;
  product_id?: string;
}

export class ReturnItemRepository extends BaseRepository<ReturnItem, ReturnItemFilters> {
  protected tableName = 'return_items';

  protected buildFindAllQuery(filters: ReturnItemFilters) {
    let query = this.db(this.tableName)
      .leftJoin('products', 'return_items.product_id', 'products.id')
      .select(
        'return_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      );

    if (filters.return_id) {
      query = query.where('return_items.return_id', filters.return_id);
    }

    if (filters.sale_item_id) {
      query = query.where('return_items.sale_item_id', filters.sale_item_id);
    }

    if (filters.product_id) {
      query = query.where('return_items.product_id', filters.product_id);
    }

    return query.orderBy('return_items.id');
  }

  protected buildCountQuery(filters: ReturnItemFilters) {
    let query = this.db(this.tableName).count('id as count');

    if (filters.return_id) {
      query = query.where('return_id', filters.return_id);
    }

    if (filters.sale_item_id) {
      query = query.where('sale_item_id', filters.sale_item_id);
    }

    if (filters.product_id) {
      query = query.where('product_id', filters.product_id);
    }

    return query;
  }

  async findByReturnId(returnId: string): Promise<ReturnItem[]> {
    return await this.db(this.tableName)
      .leftJoin('products', 'return_items.product_id', 'products.id')
      .select(
        'return_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .where('return_items.return_id', returnId)
      .orderBy('return_items.id');
  }

  async findBySaleItemId(saleItemId: string): Promise<ReturnItem[]> {
    return await this.db(this.tableName)
      .where('sale_item_id', saleItemId)
      .orderBy('created_at', 'desc');
  }

  async createBulk(returnId: string, items: Omit<ReturnItem, 'id' | 'return_id' | 'created_at' | 'updated_at'>[]): Promise<ReturnItem[]> {
    const trx = await this.db.transaction();
    
    try {
      // Delete existing items for this return
      await trx(this.tableName).where({ return_id: returnId }).del();
      
      // Insert new items
      const itemsData = items.map(item => ({
        ...item,
        return_id: returnId,
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

  async deleteByReturnId(returnId: string): Promise<boolean> {
    const result = await this.db(this.tableName).where({ return_id: returnId }).del();
    return result > 0;
  }

  static calculateLineTotal(quantityReturned: number, unitPrice: number): number {
    return quantityReturned * unitPrice;
  }

  async getSaleItemReturnStats(saleItemId: string): Promise<any> {
    const stats = await this.db(this.tableName)
      .where({ sale_item_id: saleItemId })
      .select(
        this.db.raw('COUNT(*) as total_returns'),
        this.db.raw('SUM(quantity_returned) as total_quantity_returned'),
        this.db.raw('SUM(line_total) as total_amount_returned')
      )
      .first();
    
    return stats;
  }

  async getReturnItemStats(returnId: string): Promise<any> {
    const stats = await this.db(this.tableName)
      .where({ return_id: returnId })
      .select(
        this.db.raw('COUNT(*) as total_items'),
        this.db.raw('SUM(quantity_returned) as total_quantity'),
        this.db.raw('SUM(line_total) as total_amount')
      )
      .first();
    
    return stats;
  }
}