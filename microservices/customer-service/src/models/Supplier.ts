import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { ISupplierRepository } from '../interfaces/IRepository';

export interface SupplierData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  country?: string;
  tax_number?: string;
  status: 'active' | 'inactive';
  credit_limit?: number;
  payment_terms?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface SupplierFilters {
  search?: string;
  status?: string;
  country?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SupplierStats {
  total_suppliers: number;
  active_count: number;
  inactive_count: number;
  total_credit_limit: number;
}

class SupplierRepository extends BaseRepository<SupplierData, SupplierFilters> implements ISupplierRepository {
  protected tableName = 'suppliers';

  async findByEmail(email: string): Promise<SupplierData | null> {
    const result = await this.db(this.tableName).where({ email }).first();
    return result || null;
  }

  protected buildFindAllQuery(filters: SupplierFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName);
    
    this.applyStatusFilter(query, filters);
    this.applyCountryFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'email', 'contact_person']);
    }
    
    this.applySorting(query, filters.sortBy || 'name', filters.sortOrder || 'asc');
    return query;
  }

  protected buildCountQuery(filters: SupplierFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('* as count');
    
    this.applyStatusFilter(query, filters);
    this.applyCountryFilter(query, filters);
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'email', 'contact_person']);
    }
    
    return query;
  }

  private applyStatusFilter(query: Knex.QueryBuilder, filters: SupplierFilters): void {
    if (filters.status) {
      query.where('status', filters.status);
    }
  }

  private applyCountryFilter(query: Knex.QueryBuilder, filters: SupplierFilters): void {
    if (filters.country) {
      query.where('country', filters.country);
    }
  }

  async delete(id: string): Promise<boolean> {
    const trx = await this.db.transaction();
    
    try {
      // Check if supplier has any purchases
      const purchaseCount = await trx('purchases')
        .where('supplier_id', id)
        .count('id as count')
        .first();
      
      if (parseInt(purchaseCount.count) > 0) {
        throw new Error('Cannot delete supplier with existing purchases');
      }
      
      const result = await trx(this.tableName).where({ id }).del();
      await trx.commit();
      return result > 0;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getSupplierStats(): Promise<SupplierStats> {
    const stats = await this.db(this.tableName)
      .select(
        this.db.raw('COUNT(*) as total_suppliers'),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as active_count', ['active']),
        this.db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as inactive_count', ['inactive']),
        this.db.raw('SUM(credit_limit) as total_credit_limit')
      )
      .first();
    
    return {
      total_suppliers: parseInt(stats.total_suppliers) || 0,
      active_count: parseInt(stats.active_count) || 0,
      inactive_count: parseInt(stats.inactive_count) || 0,
      total_credit_limit: parseFloat(stats.total_credit_limit) || 0
    };
  }

  async getSupplierPurchases(supplierId: string, filters: any = {}): Promise<any[]> {
    let query = this.db('purchases')
      .where({ supplier_id: supplierId })
      .select('*')
      .orderBy('created_at', 'desc');
    
    if (filters.date_from) {
      query = query.where('purchase_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('purchase_date', '<=', filters.date_to);
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    return await query.limit(limit).offset(offset);
  }
}

export default new SupplierRepository();