import { BaseRepository } from '../../common/BaseRepository';
import { IQuotationRepository } from '../../interfaces/IRepository';
import { QuotationData, QuotationFilters } from './quotation.types';
import { QuotationMapper } from './quotation.mapper';
import { Knex } from 'knex';

export class QuotationRepository extends BaseRepository<QuotationData, QuotationFilters> implements IQuotationRepository {
  protected tableName = 'quotations';

  protected buildFindAllQuery(filters: QuotationFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName)
      .select(
        'quotations.*',
        this.db.raw('NULL as customer_name'),
        this.db.raw('NULL as customer_email'),
        this.db.raw('NULL as customer_phone')
      );

    if (filters.customer_id) {
      query = query.where('quotations.customer_id', parseInt(filters.customer_id));
    }

    if (filters.status) {
      query = query.where('quotations.status', filters.status);
    }

    if (filters.date_from) {
      query = query.where('quotations.quotation_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('quotations.quotation_date', '<=', filters.date_to);
    }

    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'quotations.quotation_number'
      ]);
    }

    this.applySorting(query, filters.sortBy || 'created_at', filters.sortOrder || 'desc');

    return query;
  }

  protected buildCountQuery(filters: QuotationFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('quotations.id as count');

    if (filters.customer_id) {
      query = query.where('quotations.customer_id', parseInt(filters.customer_id));
    }

    if (filters.status) {
      query = query.where('quotations.status', filters.status);
    }

    if (filters.date_from) {
      query = query.where('quotations.quotation_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('quotations.quotation_date', '<=', filters.date_to);
    }

    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'quotations.quotation_number'
      ]);
    }

    return query;
  }

  async findById(id: string): Promise<QuotationData | null> {
    const result = await this.db(this.tableName)
      .select(
        'quotations.*',
        this.db.raw('NULL as customer_name'),
        this.db.raw('NULL as customer_email'),
        this.db.raw('NULL as customer_phone')
      )
      .where('quotations.id', parseInt(id))
      .first();
    
    return result ? QuotationMapper.toQuotationData(result) : null;
  }

  async create(data: Omit<QuotationData, 'id' | 'created_at' | 'updated_at'>): Promise<QuotationData> {
    const dbData = QuotationMapper.toDatabase(data);
    const quotationNumber = await this.generateQuotationNumber();
    
    const [result] = await this.db(this.tableName)
      .insert({
        ...dbData,
        quotation_number: quotationNumber,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return QuotationMapper.toQuotationData(result);
  }

  async update(id: string, data: Partial<QuotationData>): Promise<QuotationData | null> {
    const dbData = QuotationMapper.toDatabase(data);
    
    const [result] = await this.db(this.tableName)
      .where('id', parseInt(id))
      .update({
        ...dbData,
        updated_at: new Date()
      })
      .returning('*');
    
    return result ? QuotationMapper.toQuotationData(result) : null;
  }

  async findByQuotationNumber(quotationNumber: string): Promise<QuotationData | null> {
    const result = await this.db(this.tableName)
      .select(
        'quotations.*',
        this.db.raw('NULL as customer_name'),
        this.db.raw('NULL as customer_email'),
        this.db.raw('NULL as customer_phone')
      )
      .where('quotations.quotation_number', quotationNumber)
      .first();
    
    return result ? QuotationMapper.toQuotationData(result) : null;
  }

  async getQuotationStats(filters?: QuotationFilters): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.customer_id) {
      query = query.where('customer_id', parseInt(filters.customer_id));
    }

    if (filters?.date_from) {
      query = query.where('quotation_date', '>=', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.where('quotation_date', '<=', filters.date_to);
    }

    const stats = await query.select(
      this.db.raw('COUNT(*) as total_quotations'),
      this.db.raw('COALESCE(SUM(total_amount), 0) as total_value'),
      this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as draft_count', ['draft']),
      this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as sent_count', ['sent']),
      this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as accepted_count', ['accepted']),
      this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as declined_count', ['declined']),
      this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as expired_count', ['expired']),
      this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as converted_count', ['converted']),
      this.db.raw('COALESCE(AVG(total_amount), 0) as average_quotation_amount')
    ).first();
    
    return {
      total_quotations: parseInt(stats.total_quotations) || 0,
      total_value: parseFloat(stats.total_value) || 0,
      draft_count: parseInt(stats.draft_count) || 0,
      sent_count: parseInt(stats.sent_count) || 0,
      accepted_count: parseInt(stats.accepted_count) || 0,
      declined_count: parseInt(stats.declined_count) || 0,
      expired_count: parseInt(stats.expired_count) || 0,
      converted_count: parseInt(stats.converted_count) || 0,
      average_quotation_amount: parseFloat(stats.average_quotation_amount) || 0
    };
  }

  async getExpiredQuotations(): Promise<QuotationData[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const results = await this.db(this.tableName)
      .select(
        'quotations.*',
        this.db.raw('NULL as customer_name'),
        this.db.raw('NULL as customer_email'),
        this.db.raw('NULL as customer_phone')
      )
      .where('quotations.validity_date', '<', today)
      .whereIn('quotations.status', ['draft', 'sent']);
    
    return QuotationMapper.toQuotationDataArray(results);
  }

  async generateQuotationNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `QT-${year}${month}`;
    
    const lastQuotation = await this.db(this.tableName)
      .where('quotation_number', 'like', `${prefix}%`)
      .orderBy('quotation_number', 'desc')
      .first();
    
    let nextNumber = 1;
    if (lastQuotation) {
      const lastNumber = parseInt(lastQuotation.quotation_number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}-${String(nextNumber).padStart(5, '0')}`;
  }

  async getQuotationCountForMonth(year: number, month: number): Promise<number> {
    const prefix = `QT-${year}${String(month).padStart(2, '0')}`;
    
    const result = await this.db(this.tableName)
      .where('quotation_number', 'like', `${prefix}%`)
      .count('id as count')
      .first();
    
    return parseInt(result?.count as string) || 0;
  }
}
