const db = require('../config/database');

class Customer {
  static get tableName() {
    return 'customers';
  }

  static async findById(id) {
    return await db(this.tableName).where({ id }).first();
  }

  static async findByEmail(email) {
    return await db(this.tableName).where({ email }).first();
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName);
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('email', 'ilike', `%${filters.search}%`)
            .orWhere('phone', 'ilike', `%${filters.search}%`)
            .orWhere('company', 'ilike', `%${filters.search}%`);
      });
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.type) {
      query = query.where('type', filters.type);
    }
    
    const limit = filters.limit || 10;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const customers = await query
      .orderBy(filters.sortBy || 'created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: customers,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName).count('* as count');
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(customerData) {
    const [customer] = await db(this.tableName)
      .insert({
        ...customerData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return customer;
  }

  static async update(id, customerData) {
    const [customer] = await db(this.tableName)
      .where({ id })
      .update({
        ...customerData,
        updated_at: new Date()
      })
      .returning('*');
    
    return customer;
  }

  static async delete(id) {
    return await db(this.tableName).where({ id }).del();
  }

  static async updateCredit(id, amount, type = 'add') {
    const customer = await this.findById(id);
    if (!customer) throw new Error('Customer not found');
    
    let newCredit;
    if (type === 'add') {
      newCredit = (customer.credit_limit || 0) + amount;
    } else {
      newCredit = (customer.credit_limit || 0) - amount;
    }
    
    const [updatedCustomer] = await db(this.tableName)
      .where({ id })
      .update({
        credit_limit: Math.max(0, newCredit),
        updated_at: new Date()
      })
      .returning('*');
    
    // Log credit movement
    await db('customer_credit_history').insert({
      customer_id: id,
      amount: amount,
      type: type,
      previous_credit: customer.credit_limit || 0,
      new_credit: newCredit,
      created_at: new Date()
    });
    
    return updatedCustomer;
  }

  static async getCreditHistory(customerId) {
    return await db('customer_credit_history')
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc');
  }

  static async getCustomerStats(customerId) {
    const stats = await db('invoices')
      .where({ customer_id: customerId })
      .select(
        db.raw('COUNT(*) as total_orders'),
        db.raw('SUM(total) as total_spent'),
        db.raw('AVG(total) as average_order'),
        db.raw('MAX(created_at) as last_order_date')
      )
      .first();
    
    return stats;
  }
}

module.exports = Customer;