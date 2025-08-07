const db = require('../config/database');

class Supplier {
  static get tableName() {
    return 'suppliers';
  }

  static async findById(id) {
    return await db(this.tableName)
      .where('id', id)
      .first();
  }

  static async findByIds(ids) {
    return await db(this.tableName)
      .whereIn('id', ids);
  }

  static async findByEmail(email) {
    return await db(this.tableName)
      .where('email', email)
      .first();
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName).select('*');
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.country) {
      query = query.where('country', filters.country);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('email', 'ilike', `%${filters.search}%`)
            .orWhere('contact_person', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const suppliers = await query
      .orderBy(filters.sortBy || 'name', filters.sortOrder || 'asc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: suppliers,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName).count('id as count');
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.country) {
      query = query.where('country', filters.country);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('email', 'ilike', `%${filters.search}%`)
            .orWhere('contact_person', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(supplierData) {
    const [supplier] = await db(this.tableName)
      .insert({
        ...supplierData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return supplier;
  }

  static async update(id, supplierData) {
    const [supplier] = await db(this.tableName)
      .where({ id })
      .update({
        ...supplierData,
        updated_at: new Date()
      })
      .returning('*');
    
    return supplier;
  }

  static async delete(id) {
    // Check if supplier has any purchases
    const purchaseCount = await db('purchases')
      .where('supplier_id', id)
      .count('id as count')
      .first();
    
    if (parseInt(purchaseCount.count) > 0) {
      throw new Error('Cannot delete supplier with existing purchases');
    }
    
    return await db(this.tableName).where({ id }).del();
  }

  static async getSupplierStats() {
    const stats = await db(this.tableName)
      .select(
        db.raw('COUNT(*) as total_suppliers'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as active_count', ['active']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as inactive_count', ['inactive']),
        db.raw('SUM(credit_limit) as total_credit_limit')
      )
      .first();
    
    return stats;
  }
}

module.exports = Supplier;