import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { ICustomerRepository } from '../interfaces/IRepository';

export interface CustomerData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tax_number?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'blocked';
  credit_limit?: number;
  used_credit?: number;
  available_credit?: number;
  overdue_amount?: number;
  total_outstanding?: number;
  credit_status: 'good' | 'warning' | 'blocked';
  payment_terms: 'immediate' | 'net_7' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90';
  preferred_language: 'en' | 'ar';
  created_at?: Date;
  updated_at?: Date;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  type?: string;
  credit_status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: Date;
}

export interface CreditHistoryEntry {
  id?: string;
  customer_id: string;
  amount: number;
  type: 'add' | 'subtract';
  previous_credit: number;
  new_credit: number;
  reason?: string;
  reference_type?: string;
  created_at?: Date;
}

class CustomerRepository extends BaseRepository<CustomerData, CustomerFilters> implements ICustomerRepository {
  protected tableName = 'customers';

  async findByEmail(email: string): Promise<CustomerData | null> {
    const result = await this.db(this.tableName).where({ email }).first();
    return result || null;
  }

  protected buildFindAllQuery(filters: CustomerFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName);
    
    this.applyStatusFilter(query, filters);
    this.applyTypeFilter(query, filters);
    this.applyCreditStatusFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'email', 'phone', 'company']);
    }
    
    this.applySorting(query, filters.sortBy, filters.sortOrder);
    return query;
  }

  protected buildCountQuery(filters: CustomerFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('* as count');
    
    this.applyStatusFilter(query, filters);
    this.applyTypeFilter(query, filters);
    this.applyCreditStatusFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'email', 'phone', 'company']);
    }
    
    return query;
  }

  private applyStatusFilter(query: Knex.QueryBuilder, filters: CustomerFilters): void {
    if (filters.status) {
      query.where('status', filters.status);
    }
  }

  private applyTypeFilter(query: Knex.QueryBuilder, filters: CustomerFilters): void {
    if (filters.type) {
      query.where('type', filters.type);
    }
  }

  private applyCreditStatusFilter(query: Knex.QueryBuilder, filters: CustomerFilters): void {
    if (filters.credit_status) {
      query.where('credit_status', filters.credit_status);
    }
  }

  async updateCredit(id: string, amount: number, type: 'add' | 'subtract'): Promise<CustomerData | null> {
    const trx = await this.db.transaction();
    
    try {
      const customer = await trx(this.tableName).where({ id }).first();
      if (!customer) {
        await trx.rollback();
        return null;
      }
      
      const newUsedCredit = type === 'add' 
        ? customer.used_credit + amount 
        : Math.max(0, customer.used_credit - amount);
      
      const newAvailableCredit = Math.max(0, customer.credit_limit - newUsedCredit);
      
      const [updatedCustomer] = await trx(this.tableName)
        .where({ id })
        .update({
          used_credit: newUsedCredit,
          available_credit: newAvailableCredit,
          updated_at: new Date()
        })
        .returning('*');
      
      await trx.commit();
      return updatedCustomer;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getCreditHistory(customerId: string): Promise<CreditHistoryEntry[]> {
    return await this.db('customer_credit_history')
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc');
  }

  async getCustomerStats(customerId: string): Promise<CustomerStats> {
    const stats = await this.db('sales')
      .where({ customer_id: customerId })
      .select(
        this.db.raw('COUNT(*) as total_orders'),
        this.db.raw('SUM(total_amount) as total_spent'),
        this.db.raw('AVG(total_amount) as average_order_value'),
        this.db.raw('MAX(sale_date) as last_order_date')
      )
      .first();
    
    return {
      total_orders: parseInt(stats.total_orders) || 0,
      total_spent: parseFloat(stats.total_spent) || 0,
      average_order_value: parseFloat(stats.average_order_value) || 0,
      last_order_date: stats.last_order_date || null
    };
  }
}

export default new CustomerRepository();