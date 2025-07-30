const db = require('../config/database');

class PaymentMethod {
  static get tableName() {
    return 'payment_methods';
  }

  static async findById(id) {
    return await db(this.tableName).where({ id }).first();
  }

  static async findByCode(code) {
    return await db(this.tableName).where({ code }).first();
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName);
    
    if (filters.is_active !== undefined) {
      query = query.where('is_active', filters.is_active);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('code', 'ilike', `%${filters.search}%`);
      });
    }
    
    return await query.orderBy('name', 'asc');
  }

  static async create(methodData) {
    const [method] = await db(this.tableName)
      .insert({
        ...methodData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return method;
  }

  static async update(id, methodData) {
    const [method] = await db(this.tableName)
      .where({ id })
      .update({
        ...methodData,
        updated_at: new Date()
      })
      .returning('*');
    
    return method;
  }

  static async delete(id) {
    return await db(this.tableName).where({ id }).del();
  }

  static async getActiveMethods() {
    return await db(this.tableName)
      .where({ is_active: true })
      .orderBy('name', 'asc');
  }

  static async initializeDefaultMethods() {
    const defaultMethods = [
      {
        name: 'Cash',
        code: 'cash',
        description: 'Cash payment',
        is_active: true,
        requires_reference: false,
        requires_approval: false
      },
      {
        name: 'Bank Transfer',
        code: 'bank_transfer',
        description: 'Bank transfer payment',
        is_active: true,
        requires_reference: true,
        requires_approval: false
      },
      {
        name: 'Credit',
        code: 'credit',
        description: 'Credit payment',
        is_active: true,
        requires_reference: false,
        requires_approval: true
      },
      {
        name: 'Check',
        code: 'check',
        description: 'Check payment',
        is_active: true,
        requires_reference: true,
        requires_approval: true,
        validation_rules: {
          requires_image: true,
          check_number_required: true
        }
      }
    ];

    for (const method of defaultMethods) {
      const existing = await this.findByCode(method.code);
      if (!existing) {
        await this.create(method);
      }
    }
  }
}

module.exports = PaymentMethod;