import { Knex } from 'knex';
import db from '../config/database';

interface PaymentMethodData {
  id?: string;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  requires_reference?: boolean;
  requires_approval?: boolean;
  validation_rules?: {
    requires_image?: boolean;
    check_number_required?: boolean;
  };
  created_at?: Date;
  updated_at?: Date;
}

interface PaymentMethodFilters {
  is_active?: boolean;
  search?: string;
}

class PaymentMethod {
  static get tableName(): string {
    return 'payment_methods';
  }

  static async findById(id: string): Promise<PaymentMethodData | undefined> {
    return await db(this.tableName).where({ id }).first();
  }

  static async findByCode(code: string): Promise<PaymentMethodData | undefined> {
    return await db(this.tableName).where({ code }).first();
  }

  static async findAll(filters: PaymentMethodFilters = {}): Promise<PaymentMethodData[]> {
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

  static async create(methodData: Omit<PaymentMethodData, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethodData> {
    const [method] = await db(this.tableName)
      .insert({
        ...methodData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return method;
  }

  static async update(id: string, methodData: Partial<PaymentMethodData>): Promise<PaymentMethodData> {
    const [method] = await db(this.tableName)
      .where({ id })
      .update({
        ...methodData,
        updated_at: new Date()
      })
      .returning('*');
    
    return method;
  }

  static async delete(id: string): Promise<number> {
    return await db(this.tableName).where({ id }).del();
  }

  static async getActiveMethods(): Promise<PaymentMethodData[]> {
    return await db(this.tableName)
      .where({ is_active: true })
      .orderBy('name', 'asc');
  }

  static async initializeDefaultMethods(): Promise<void> {
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

export default PaymentMethod;