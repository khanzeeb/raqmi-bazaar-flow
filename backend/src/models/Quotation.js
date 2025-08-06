const db = require('../config/database');

class Quotation {
  static get tableName() {
    return 'quotations';
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'customers.phone as customer_phone'
      )
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .where('quotations.id', id)
      .first();
  }

  static async findByQuotationNumber(quotationNumber) {
    return await db(this.tableName)
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .where('quotations.quotation_number', quotationNumber)
      .first();
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName)
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'quotations.customer_id', 'customers.id');
    
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
        this.where('quotations.quotation_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const quotations = await query
      .orderBy(filters.sortBy || 'quotations.created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: quotations,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName)
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .count('quotations.id as count');
    
    if (filters.customer_id) {
      query = query.where('quotations.customer_id', filters.customer_id);
    }
    
    if (filters.status) {
      query = query.where('quotations.status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('quotations.quotation_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(quotationData) {
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

  static async update(id, quotationData) {
    const [quotation] = await db(this.tableName)
      .where({ id })
      .update({
        ...quotationData,
        updated_at: new Date()
      })
      .returning('*');
    
    return quotation;
  }

  static async delete(id) {
    const trx = await db.transaction();
    
    try {
      // Delete related items first
      await trx('quotation_items').where({ quotation_id: id }).del();
      
      // Delete the quotation
      const result = await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async generateQuotationNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `QUO-${year}${month}`;
    
    const lastQuotation = await db(this.tableName)
      .where('quotation_number', 'like', `${prefix}%`)
      .orderBy('quotation_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastQuotation) {
      const lastSequence = parseInt(lastQuotation.quotation_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async convertToSale(quotationId) {
    const trx = await db.transaction();
    
    try {
      const quotation = await this.findById(quotationId);
      if (!quotation) {
        throw new Error('Quotation not found');
      }
      
      if (quotation.status !== 'accepted') {
        throw new Error('Only accepted quotations can be converted to sales');
      }
      
      // Update quotation status
      await this.update(quotationId, { status: 'converted' });
      
      await trx.commit();
      return quotation;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getQuotationStats(filters = {}) {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('quotation_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('quotation_date', '<=', filters.date_to);
    }
    
    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) as total_quotations'),
        db.raw('SUM(total_amount) as total_value'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as draft_count', ['draft']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as sent_count', ['sent']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as accepted_count', ['accepted']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as declined_count', ['declined']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as expired_count', ['expired']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as converted_count', ['converted']),
        db.raw('AVG(total_amount) as average_quotation_amount')
      )
      .first();
    
    return stats;
  }

  static async getExpiredQuotations() {
    return await db(this.tableName)
      .select(
        'quotations.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'quotations.customer_id', 'customers.id')
      .where('quotations.validity_date', '<', new Date().toISOString().split('T')[0])
      .whereIn('quotations.status', ['draft', 'sent'])
      .orderBy('quotations.validity_date', 'asc');
  }
}

module.exports = Quotation;