import { BaseRepository } from '../common/BaseRepository';
import { IQuotationRepository } from '../interfaces/IRepository';

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  quotation_date: string;
  validity_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';
  created_at: Date;
  updated_at: Date;
}

export interface QuotationFilters {
  customer_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class QuotationRepository extends BaseRepository<Quotation, QuotationFilters> implements IQuotationRepository {
  protected tableName = 'quotations';

  protected buildFindAllQuery(filters: QuotationFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      );

    if (filters.customer_id) {
      query = query.where('quotations.customer_id', filters.customer_id);
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
        'quotations.quotation_number',
        'customers.name',
        'customers.email'
      ]);
    }

    this.applySorting(query, filters.sortBy, filters.sortOrder);

    return query;
  }

  protected buildCountQuery(filters: QuotationFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .count('quotations.id as count');

    if (filters.customer_id) {
      query = query.where('quotations.customer_id', filters.customer_id);
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
        'quotations.quotation_number',
        'customers.name',
        'customers.email'
      ]);
    }

    return query;
  }

  async findByQuotationNumber(quotationNumber: string): Promise<Quotation | null> {
    const result = await this.db(this.tableName)
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .where('quotations.quotation_number', quotationNumber)
      .first();
    
    return result || null;
  }

  async getQuotationStats(filters?: QuotationFilters): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }

    if (filters?.date_from) {
      query = query.where('quotation_date', '>=', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.where('quotation_date', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_quotations'),
        this.db.raw('SUM(total_amount) as total_value'),
        this.db.raw('AVG(total_amount) as average_quotation_value'),
        this.db.raw("COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_quotations"),
        this.db.raw("COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotations"),
        this.db.raw("COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_quotations"),
        this.db.raw("COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_quotations")
      )
      .first();

    return stats;
  }

  async getExpiredQuotations(): Promise<Quotation[]> {
    return await this.db(this.tableName)
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .where('quotations.validity_date', '<', new Date())
      .where('quotations.status', 'sent')
      .orderBy('quotations.validity_date', 'asc');
  }

  async generateQuotationNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `QUO-${year}${month}`;

    const lastQuotation = await this.db(this.tableName)
      .where('quotation_number', 'like', `${prefix}%`)
      .orderBy('quotation_number', 'desc')
      .first();

    let nextNumber = 1;
    if (lastQuotation) {
      const lastNumber = parseInt(lastQuotation.quotation_number.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}