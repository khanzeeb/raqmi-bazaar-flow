import { BaseRepository } from '../common/BaseRepository';

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  line_total: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItemFilters {
  quotation_id?: string;
  product_id?: string;
}

export class QuotationItemRepository extends BaseRepository<QuotationItem, QuotationItemFilters> {
  protected tableName = 'quotation_items';

  protected buildFindAllQuery(filters: QuotationItemFilters) {
    let query = this.db(this.tableName)
      .leftJoin('products', 'quotation_items.product_id', 'products.id')
      .select(
        'quotation_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      );

    if (filters.quotation_id) {
      query = query.where('quotation_items.quotation_id', filters.quotation_id);
    }

    if (filters.product_id) {
      query = query.where('quotation_items.product_id', filters.product_id);
    }

    return query.orderBy('quotation_items.id');
  }

  protected buildCountQuery(filters: QuotationItemFilters) {
    let query = this.db(this.tableName).count('id as count');

    if (filters.quotation_id) {
      query = query.where('quotation_id', filters.quotation_id);
    }

    if (filters.product_id) {
      query = query.where('product_id', filters.product_id);
    }

    return query;
  }

  async findByQuotationId(quotationId: string): Promise<QuotationItem[]> {
    return await this.db(this.tableName)
      .leftJoin('products', 'quotation_items.product_id', 'products.id')
      .select(
        'quotation_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .where('quotation_items.quotation_id', quotationId)
      .orderBy('quotation_items.id');
  }

  async createBulk(quotationId: string, items: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at' | 'updated_at'>[]): Promise<QuotationItem[]> {
    const trx = await this.db.transaction();
    
    try {
      // Delete existing items for this quotation
      await trx(this.tableName).where({ quotation_id: quotationId }).del();
      
      // Insert new items
      const itemsData = items.map(item => ({
        ...item,
        quotation_id: quotationId,
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

  async deleteByQuotationId(quotationId: string): Promise<boolean> {
    const result = await this.db(this.tableName).where({ quotation_id: quotationId }).del();
    return result > 0;
  }

  static calculateLineTotal(quantity: number, unitPrice: number, discountAmount = 0, taxAmount = 0): number {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }

  async getQuotationItemStats(quotationId: string): Promise<any> {
    const stats = await this.db(this.tableName)
      .where({ quotation_id: quotationId })
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