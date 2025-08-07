const db = require('../config/database');

class Purchase {
  static get tableName() {
    return 'purchases';
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'purchases.*',
        'suppliers.name as supplier_name',
        'suppliers.email as supplier_email',
        'suppliers.phone as supplier_phone'
      )
      .leftJoin('suppliers', 'purchases.supplier_id', 'suppliers.id')
      .where('purchases.id', id)
      .first();
  }

  static async findByPurchaseNumber(purchaseNumber) {
    return await db(this.tableName)
      .select(
        'purchases.*',
        'suppliers.name as supplier_name',
        'suppliers.email as supplier_email'
      )
      .leftJoin('suppliers', 'purchases.supplier_id', 'suppliers.id')
      .where('purchases.purchase_number', purchaseNumber)
      .first();
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName)
      .select(
        'purchases.*',
        'suppliers.name as supplier_name',
        'suppliers.email as supplier_email'
      )
      .leftJoin('suppliers', 'purchases.supplier_id', 'suppliers.id');
    
    if (filters.supplier_id) {
      query = query.where('purchases.supplier_id', filters.supplier_id);
    }
    
    if (filters.status) {
      query = query.where('purchases.status', filters.status);
    }
    
    if (filters.payment_status) {
      query = query.where('purchases.payment_status', filters.payment_status);
    }
    
    if (filters.date_from) {
      query = query.where('purchases.purchase_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('purchases.purchase_date', '<=', filters.date_to);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('purchases.purchase_number', 'ilike', `%${filters.search}%`)
            .orWhere('suppliers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const purchases = await query
      .orderBy(filters.sortBy || 'purchases.created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: purchases,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName)
      .leftJoin('suppliers', 'purchases.supplier_id', 'suppliers.id')
      .count('purchases.id as count');
    
    if (filters.supplier_id) {
      query = query.where('purchases.supplier_id', filters.supplier_id);
    }
    
    if (filters.status) {
      query = query.where('purchases.status', filters.status);
    }
    
    if (filters.payment_status) {
      query = query.where('purchases.payment_status', filters.payment_status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('purchases.purchase_number', 'ilike', `%${filters.search}%`)
            .orWhere('suppliers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(purchaseData) {
    const trx = await db.transaction();
    
    try {
      // Generate purchase number if not provided
      if (!purchaseData.purchase_number) {
        purchaseData.purchase_number = await this.generatePurchaseNumber();
      }
      
      const [purchase] = await trx(this.tableName)
        .insert({
          ...purchaseData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      await trx.commit();
      return purchase;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id, purchaseData) {
    const [purchase] = await db(this.tableName)
      .where({ id })
      .update({
        ...purchaseData,
        updated_at: new Date()
      })
      .returning('*');
    
    return purchase;
  }

  static async delete(id) {
    const trx = await db.transaction();
    
    try {
      // Delete related items first
      await trx('purchase_items').where({ purchase_id: id }).del();
      
      // Delete the purchase
      const result = await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async generatePurchaseNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `PUR-${year}${month}`;
    
    const lastPurchase = await db(this.tableName)
      .where('purchase_number', 'like', `${prefix}%`)
      .orderBy('purchase_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastPurchase) {
      const lastSequence = parseInt(lastPurchase.purchase_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async getPurchaseStats(filters = {}) {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('purchase_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('purchase_date', '<=', filters.date_to);
    }
    
    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) as total_purchases'),
        db.raw('SUM(total_amount) as total_value'),
        db.raw('SUM(paid_amount) as total_paid'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as pending_count', ['pending']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as ordered_count', ['ordered']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as received_count', ['received']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as cancelled_count', ['cancelled']),
        db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as payment_pending_count', ['pending']),
        db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as payment_partial_count', ['partial']),
        db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as payment_paid_count', ['paid']),
        db.raw('AVG(total_amount) as average_purchase_amount')
      )
      .first();
    
    return stats;
  }
}

module.exports = Purchase;