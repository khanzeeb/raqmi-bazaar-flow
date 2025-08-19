import { BaseRepository } from '../common/BaseRepository';
import { ISaleRepository } from '../interfaces/IRepository';

export interface Sale {
  id: string;
  sale_number: string;
  customer_id: string;
  sale_date: string;
  due_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
  status: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
  created_at: Date;
  updated_at: Date;
}

export interface SaleFilters {
  customer_id?: string;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SaleRepository extends BaseRepository<Sale, SaleFilters> implements ISaleRepository {
  protected tableName = 'sales';

  protected buildFindAllQuery(filters: SaleFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      );

    if (filters.customer_id) {
      query = query.where('sales.customer_id', filters.customer_id);
    }

    if (filters.status) {
      query = query.where('sales.status', filters.status);
    }

    if (filters.payment_status) {
      query = query.where('sales.payment_status', filters.payment_status);
    }

    if (filters.date_from) {
      query = query.where('sales.sale_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('sales.sale_date', '<=', filters.date_to);
    }

    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'sales.sale_number',
        'customers.name',
        'customers.email'
      ]);
    }

    this.applySorting(query, filters.sortBy, filters.sortOrder);

    return query;
  }

  protected buildCountQuery(filters: SaleFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .count('sales.id as count');

    if (filters.customer_id) {
      query = query.where('sales.customer_id', filters.customer_id);
    }

    if (filters.status) {
      query = query.where('sales.status', filters.status);
    }

    if (filters.payment_status) {
      query = query.where('sales.payment_status', filters.payment_status);
    }

    if (filters.date_from) {
      query = query.where('sales.sale_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('sales.sale_date', '<=', filters.date_to);
    }

    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'sales.sale_number',
        'customers.name',
        'customers.email'
      ]);
    }

    return query;
  }

  async findBySaleNumber(saleNumber: string): Promise<Sale | null> {
    const result = await this.db(this.tableName)
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .where('sales.sale_number', saleNumber)
      .first();
    
    return result || null;
  }

  async updatePaymentAmounts(saleId: string): Promise<Sale> {
    // Get total allocated amount for this sale
    const allocations = await this.db('payment_allocations')
      .where('order_id', saleId)
      .where('order_type', 'sale')
      .sum('allocated_amount as total_allocated')
      .first();

    const totalAllocated = parseFloat(allocations?.total_allocated || '0');

    // Get sale to calculate new amounts
    const sale = await this.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }

    const balanceAmount = sale.total_amount - totalAllocated;
    let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid' = 'unpaid';

    if (totalAllocated === 0) {
      paymentStatus = 'unpaid';
    } else if (totalAllocated < sale.total_amount) {
      paymentStatus = 'partially_paid';
    } else if (totalAllocated === sale.total_amount) {
      paymentStatus = 'paid';
    } else {
      paymentStatus = 'overpaid';
    }

    const [updatedSale] = await this.db(this.tableName)
      .where('id', saleId)
      .update({
        paid_amount: totalAllocated,
        balance_amount: balanceAmount,
        payment_status: paymentStatus,
        updated_at: new Date()
      })
      .returning('*');

    return updatedSale;
  }

  async getSaleStats(filters?: SaleFilters): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }

    if (filters?.date_from) {
      query = query.where('sale_date', '>=', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.where('sale_date', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_sales'),
        this.db.raw('SUM(total_amount) as total_revenue'),
        this.db.raw('SUM(paid_amount) as total_collected'),
        this.db.raw('SUM(balance_amount) as total_outstanding'),
        this.db.raw('AVG(total_amount) as average_sale_value'),
        this.db.raw("COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_sales"),
        this.db.raw("COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_sales")
      )
      .first();

    return stats;
  }

  async getOverdueSales(): Promise<Sale[]> {
    return await this.db(this.tableName)
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .where('sales.due_date', '<', new Date())
      .whereIn('sales.payment_status', ['unpaid', 'partially_paid'])
      .orderBy('sales.due_date', 'asc');
  }

  async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SAL-${year}${month}`;

    const lastSale = await this.db(this.tableName)
      .where('sale_number', 'like', `${prefix}%`)
      .orderBy('sale_number', 'desc')
      .first();

    let nextNumber = 1;
    if (lastSale) {
      const lastNumber = parseInt(lastSale.sale_number.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}