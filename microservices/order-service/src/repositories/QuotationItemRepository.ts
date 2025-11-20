import { BaseRepository } from '../common/BaseRepository';
import { QuotationItemData, QuotationItemFilters } from '../models/QuotationItem';
import { QuotationItemMapper } from '../mappers/QuotationItemMapper';
import { Knex } from 'knex';

export class QuotationItemRepository extends BaseRepository<QuotationItemData, QuotationItemFilters> {
  protected tableName = 'quotation_items';

  protected buildFindAllQuery(filters: QuotationItemFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName)
      .select(
        'quotation_items.*',
        this.db.raw('NULL as current_product_name'),
        this.db.raw('NULL as current_product_sku')
      );

    if (filters.quotation_id) {
      query = query.where('quotation_items.quotation_id', parseInt(filters.quotation_id));
    }

    if (filters.product_id) {
      query = query.where('quotation_items.product_id', parseInt(filters.product_id));
    }

    return query.orderBy('quotation_items.id');
  }

  protected buildCountQuery(filters: QuotationItemFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('id as count');

    if (filters.quotation_id) {
      query = query.where('quotation_id', parseInt(filters.quotation_id));
    }

    if (filters.product_id) {
      query = query.where('product_id', parseInt(filters.product_id));
    }

    return query;
  }

  async findById(id: string): Promise<QuotationItemData | null> {
    const result = await this.db(this.tableName)
      .select(
        'quotation_items.*',
        this.db.raw('NULL as current_product_name'),
        this.db.raw('NULL as current_product_sku')
      )
      .where('quotation_items.id', parseInt(id))
      .first();
    
    return result ? QuotationItemMapper.toQuotationItemData(result) : null;
  }

  async create(data: Omit<QuotationItemData, 'id' | 'created_at' | 'updated_at'>): Promise<QuotationItemData> {
    const dbData = QuotationItemMapper.toDatabase(data, data.quotation_id);
    
    const [result] = await this.db(this.tableName)
      .insert({
        ...dbData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return QuotationItemMapper.toQuotationItemData(result);
  }

  async update(id: string, data: Partial<QuotationItemData>): Promise<QuotationItemData | null> {
    const dbData = QuotationItemMapper.toDatabase(data);
    
    const [result] = await this.db(this.tableName)
      .where('id', parseInt(id))
      .update({
        ...dbData,
        updated_at: new Date()
      })
      .returning('*');
    
    return result ? QuotationItemMapper.toQuotationItemData(result) : null;
  }

  async findByQuotationId(quotationId: string): Promise<QuotationItemData[]> {
    const results = await this.db(this.tableName)
      .select(
        'quotation_items.*',
        this.db.raw('NULL as current_product_name'),
        this.db.raw('NULL as current_product_sku')
      )
      .where('quotation_items.quotation_id', parseInt(quotationId))
      .orderBy('quotation_items.id');
    
    return QuotationItemMapper.toQuotationItemDataArray(results);
  }

  async createBulk(quotationId: string, items: Omit<QuotationItemData, 'id' | 'quotation_id' | 'created_at' | 'updated_at'>[]): Promise<QuotationItemData[]> {
    const trx = await this.db.transaction();
    
    try {
      // Delete existing items for this quotation
      await trx(this.tableName).where({ quotation_id: parseInt(quotationId) }).del();
      
      // Insert new items
      const itemsData = items.map(item => {
        const dbData = QuotationItemMapper.toDatabase(item, quotationId);
        return {
          ...dbData,
          created_at: new Date(),
          updated_at: new Date()
        };
      });
      
      const newItems = await trx(this.tableName)
        .insert(itemsData)
        .returning('*');
      
      await trx.commit();
      return QuotationItemMapper.toQuotationItemDataArray(newItems);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async deleteByQuotationId(quotationId: string): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where({ quotation_id: parseInt(quotationId) })
      .del();
    return result > 0;
  }

  async getQuotationItemStats(quotationId: string): Promise<any> {
    const stats = await this.db(this.tableName)
      .where({ quotation_id: parseInt(quotationId) })
      .select(
        this.db.raw('COUNT(*) as total_items'),
        this.db.raw('COALESCE(SUM(quantity), 0) as total_quantity'),
        this.db.raw('COALESCE(SUM(line_total), 0) as total_amount'),
        this.db.raw('COALESCE(SUM(discount_amount), 0) as total_discount'),
        this.db.raw('COALESCE(SUM(tax_amount), 0) as total_tax')
      )
      .first();
    
    return {
      total_items: parseInt(stats.total_items) || 0,
      total_quantity: parseFloat(stats.total_quantity) || 0,
      total_amount: parseFloat(stats.total_amount) || 0,
      total_discount: parseFloat(stats.total_discount) || 0,
      total_tax: parseFloat(stats.total_tax) || 0
    };
  }
}
