const db = require('../config/database');

class Return {
  static get tableName() {
    return 'returns';
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'returns.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'sales.sale_number',
        'users.name as processed_by_name'
      )
      .leftJoin('customers', 'returns.customer_id', 'customers.id')
      .leftJoin('sales', 'returns.sale_id', 'sales.id')
      .leftJoin('users', 'returns.processed_by', 'users.id')
      .where('returns.id', id)
      .first();
  }

  static async findBySaleId(saleId) {
    return await db(this.tableName)
      .select(
        'returns.*',
        'customers.name as customer_name'
      )
      .leftJoin('customers', 'returns.customer_id', 'customers.id')
      .where('returns.sale_id', saleId)
      .orderBy('returns.created_at', 'desc');
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName)
      .select(
        'returns.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'sales.sale_number',
        'users.name as processed_by_name'
      )
      .leftJoin('customers', 'returns.customer_id', 'customers.id')
      .leftJoin('sales', 'returns.sale_id', 'sales.id')
      .leftJoin('users', 'returns.processed_by', 'users.id');

    // Apply filters
    if (filters.customer_id) {
      query = query.where('returns.customer_id', filters.customer_id);
    }
    
    if (filters.status) {
      query = query.where('returns.status', filters.status);
    }
    
    if (filters.return_type) {
      query = query.where('returns.return_type', filters.return_type);
    }
    
    if (filters.date_from) {
      query = query.where('returns.return_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('returns.return_date', '<=', filters.date_to);
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const totalQuery = query.clone().clearSelect().count('* as total').first();
    const dataQuery = query.orderBy('returns.created_at', 'desc')
                          .limit(limit)
                          .offset(offset);

    const [total, data] = await Promise.all([totalQuery, dataQuery]);

    return {
      data,
      total: total.total,
      page,
      limit,
      totalPages: Math.ceil(total.total / limit)
    };
  }

  static async create(returnData) {
    const [returnRecord] = await db(this.tableName)
      .insert({
        ...returnData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return returnRecord;
  }

  static async update(id, returnData) {
    const [returnRecord] = await db(this.tableName)
      .where({ id })
      .update({
        ...returnData,
        updated_at: new Date()
      })
      .returning('*');
    
    return returnRecord;
  }

  static async delete(id) {
    return await db(this.tableName).where({ id }).del();
  }

  static async generateReturnNumber() {
    const today = new Date();
    const prefix = `RET-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastReturn = await db(this.tableName)
      .where('return_number', 'like', `${prefix}%`)
      .orderBy('return_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastReturn) {
      const lastSequence = parseInt(lastReturn.return_number.split('-').pop());
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async getReturnStats(filters = {}) {
    let query = db(this.tableName);

    if (filters.date_from) {
      query = query.where('return_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('return_date', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_returns'),
        db.raw('SUM(total_amount) as total_return_amount'),
        db.raw('SUM(refund_amount) as total_refund_amount'),
        db.raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed_returns'),
        db.raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_returns'),
        db.raw('COUNT(CASE WHEN return_type = "full" THEN 1 END) as full_returns'),
        db.raw('COUNT(CASE WHEN return_type = "partial" THEN 1 END) as partial_returns')
      )
      .first();

    return stats;
  }
}

module.exports = Return;