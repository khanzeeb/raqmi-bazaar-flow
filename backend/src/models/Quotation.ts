import db from '../config/database';

interface QuotationData {
  customer_id: string;
  quotation_number?: string;
  quotation_date: Date;
  validity_date: Date;
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  user_id: string;
}

interface QuotationFilters {
  page?: number;
  limit?: number;
  customer_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class Quotation {
  static get tableName() {
    return 'quotations';
  }

  static async findById(id: string) {
    return await db(this.tableName)
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'users.name as user_name'
      )
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .leftJoin('users', 'quotations.user_id', 'users.id')
      .where('quotations.id', id)
      .first();
  }

  static async findAll(filters: QuotationFilters = {}) {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = filters;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'users.name as user_name'
      )
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .leftJoin('users', 'quotations.user_id', 'users.id');

    // Apply filters
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
      query = query.where(function() {
        this.where('quotations.quotation_number', 'like', `%${filters.search}%`)
            .orWhere('customers.name', 'like', `%${filters.search}%`)
            .orWhere('quotations.notes', 'like', `%${filters.search}%`);
      });
    }

    // Get total count for pagination
    const totalQuery = query.clone();
    const total = await totalQuery.count('quotations.id as count').first();
    const totalCount = total ? parseInt(total.count as string) : 0;

    // Apply pagination and sorting
    const quotations = await query
      .orderBy(`quotations.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data: quotations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  static async create(quotationData: QuotationData) {
    const trx = await db.transaction();
    
    try {
      // Generate quotation number if not provided
      if (!quotationData.quotation_number) {
        quotationData.quotation_number = await this.generateQuotationNumber();
      }

      const [quotation] = await trx(this.tableName)
        .insert({
          ...quotationData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      await trx.commit();
      return quotation;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: string, quotationData: Partial<QuotationData>) {
    const [quotation] = await db(this.tableName)
      .where({ id })
      .update({
        ...quotationData,
        updated_at: new Date()
      })
      .returning('*');
    
    return quotation;
  }

  static async delete(id: string) {
    return await db(this.tableName).where({ id }).del();
  }

  static async generateQuotationNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get the last quotation number for this month
    const lastQuotation = await db(this.tableName)
      .where('quotation_number', 'like', `QUO-${year}${month}-%`)
      .orderBy('quotation_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastQuotation && lastQuotation.quotation_number) {
      const lastSequence = parseInt(lastQuotation.quotation_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `QUO-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  static async getQuotationStats(filters: QuotationFilters = {}) {
    let query = db(this.tableName);

    // Apply filters
    if (filters.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }

    if (filters.date_from) {
      query = query.where('quotation_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('quotation_date', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_quotations'),
        db.raw('SUM(total_amount) as total_amount'),
        db.raw('COUNT(CASE WHEN status = "sent" THEN 1 END) as sent_count'),
        db.raw('COUNT(CASE WHEN status = "accepted" THEN 1 END) as accepted_count'),
        db.raw('COUNT(CASE WHEN status = "declined" THEN 1 END) as declined_count'),
        db.raw('COUNT(CASE WHEN status = "expired" THEN 1 END) as expired_count'),
        db.raw('SUM(CASE WHEN status = "accepted" THEN total_amount ELSE 0 END) as accepted_amount')
      )
      .first();

    return stats;
  }

  static async getExpiredQuotations() {
    return await db(this.tableName)
      .select('*')
      .where('validity_date', '<', new Date())
      .where('status', 'in', ['draft', 'sent'])
      .orderBy('validity_date', 'asc');
  }
}