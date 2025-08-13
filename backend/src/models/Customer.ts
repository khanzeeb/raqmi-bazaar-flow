import { Knex } from 'knex';
import db from '../config/database';

interface CustomerData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  credit_limit?: number;
  status?: 'active' | 'inactive';
  type?: 'individual' | 'business';
  tax_number?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CustomerFilters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CustomerStats {
  total_orders: number;
  total_spent: number;
  average_order: number;
  last_order_date: Date;
}

interface CreditHistoryEntry {
  customer_id: string;
  amount: number;
  type: 'add' | 'subtract';
  previous_credit: number;
  new_credit: number;
  created_at: Date;
}

class Customer {
  static get tableName(): string {
    return 'customers';
  }

  static async findById(id: string): Promise<CustomerData | undefined> {
    return await db(this.tableName).where({ id }).first();
  }

  static async findByEmail(email: string): Promise<CustomerData | undefined> {
    return await db(this.tableName).where({ email }).first();
  }

  static async findAll(filters: CustomerFilters = {}) {
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

  static async count(filters: CustomerFilters = {}): Promise<number> {
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

  static async create(customerData: Omit<CustomerData, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerData> {
    const [customer] = await db(this.tableName)
      .insert({
        ...customerData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return customer;
  }

  static async update(id: string, customerData: Partial<CustomerData>): Promise<CustomerData> {
    const [customer] = await db(this.tableName)
      .where({ id })
      .update({
        ...customerData,
        updated_at: new Date()
      })
      .returning('*');
    
    return customer;
  }

  static async delete(id: string): Promise<number> {
    return await db(this.tableName).where({ id }).del();
  }

  static async updateCredit(id: string, amount: number, type: 'add' | 'subtract' = 'add'): Promise<CustomerData> {
    const customer = await this.findById(id);
    if (!customer) throw new Error('Customer not found');
    
    let newCredit: number;
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

  static async getCreditHistory(customerId: string): Promise<CreditHistoryEntry[]> {
    return await db('customer_credit_history')
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc');
  }

  static async getCustomerStats(customerId: string): Promise<CustomerStats> {
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

export default Customer;