import { Knex } from 'knex';
import db from '../config/database';

interface SaleData {
  id?: string;
  sale_number?: string;
  customer_id: string;
  sale_date: Date | string;
  due_date?: Date | string;
  subtotal_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  paid_amount?: number;
  balance_amount?: number;
  payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
  status?: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  currency?: string;
  exchange_rate?: number;
  notes?: string;
  terms_conditions?: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  customer_name?: string;
  customer_email?: string;
}

interface SaleFilters {
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

interface SaleStats {
  total_sales: number;
  total_revenue: number;
  total_collected: number;
  total_outstanding: number;
  paid_count: number;
  partially_paid_count: number;
  unpaid_count: number;
  average_sale_amount: number;
}

interface PaymentAmounts {
  paid_amount: number;
  balance_amount: number;
  payment_status: string;
}

class Sale {
  static get tableName(): string {
    return 'sales';
  }

  static async findById(id: string): Promise<SaleData | undefined> {
    return await db(this.tableName)
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .where('sales.id', id)
      .first();
  }

  static async findBySaleNumber(saleNumber: string): Promise<SaleData | undefined> {
    return await db(this.tableName)
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .where('sales.sale_number', saleNumber)
      .first();
  }

  static async findAll(filters: SaleFilters = {}) {
    let query = db(this.tableName)
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'sales.customer_id', 'customers.id');
    
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
      query = query.where(function() {
        this.where('sales.sale_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const sales = await query
      .orderBy(filters.sortBy || 'sales.created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: sales,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters: SaleFilters = {}): Promise<number> {
    let query = db(this.tableName)
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .count('sales.id as count');
    
    if (filters.customer_id) {
      query = query.where('sales.customer_id', filters.customer_id);
    }
    
    if (filters.status) {
      query = query.where('sales.status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('sales.sale_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(saleData: Omit<SaleData, 'id' | 'created_at' | 'updated_at'>): Promise<SaleData> {
    const trx = await db.transaction();
    
    try {
      // Generate sale number if not provided
      if (!saleData.sale_number) {
        saleData.sale_number = await this.generateSaleNumber();
      }
      
      // Calculate balance amount
      saleData.balance_amount = saleData.total_amount - (saleData.paid_amount || 0);
      
      const [sale] = await trx(this.tableName)
        .insert({
          ...saleData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      await trx.commit();
      return sale;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: string, saleData: Partial<SaleData>): Promise<SaleData> {
    const trx = await db.transaction();
    
    try {
      // Recalculate balance if amounts changed
      if (saleData.total_amount !== undefined || saleData.paid_amount !== undefined) {
        const currentSale = await trx(this.tableName).where({ id }).first();
        const totalAmount = saleData.total_amount || currentSale.total_amount;
        const paidAmount = saleData.paid_amount || currentSale.paid_amount;
        saleData.balance_amount = totalAmount - paidAmount;
        
        // Update payment status
        saleData.payment_status = this.calculatePaymentStatus(totalAmount, paidAmount);
      }
      
      const [sale] = await trx(this.tableName)
        .where({ id })
        .update({
          ...saleData,
          updated_at: new Date()
        })
        .returning('*');
      
      await trx.commit();
      return sale;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: string): Promise<number> {
    const trx = await db.transaction();
    
    try {
      // Delete related items first
      await trx('sale_items').where({ sale_id: id }).del();
      
      // Delete related payment allocations
      await trx('payment_allocations')
        .where({ order_id: id, order_type: 'sale' })
        .del();
      
      // Delete the sale
      const result = await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `SAL-${year}${month}`;
    
    const lastSale = await db(this.tableName)
      .where('sale_number', 'like', `${prefix}%`)
      .orderBy('sale_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.sale_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static calculatePaymentStatus(totalAmount: number, paidAmount: number): string {
    if (paidAmount <= 0) return 'unpaid';
    if (paidAmount >= totalAmount) return paidAmount > totalAmount ? 'overpaid' : 'paid';
    return 'partially_paid';
  }

  static async updatePaymentAmounts(saleId: string): Promise<PaymentAmounts> {
    const trx = await db.transaction();
    
    try {
      // Get total paid amount from payment allocations
      const allocationsSum = await trx('payment_allocations')
        .where({ order_id: saleId, order_type: 'sale' })
        .sum('allocated_amount as total')
        .first();
      
      const totalPaid = parseFloat(allocationsSum.total) || 0;
      
      // Get sale
      const sale = await trx(this.tableName).where({ id: saleId }).first();
      const balanceAmount = sale.total_amount - totalPaid;
      const paymentStatus = this.calculatePaymentStatus(sale.total_amount, totalPaid);
      
      // Update sale payment amounts
      await trx(this.tableName)
        .where({ id: saleId })
        .update({
          paid_amount: totalPaid,
          balance_amount: balanceAmount,
          payment_status: paymentStatus,
          updated_at: new Date()
        });
      
      await trx.commit();
      return { paid_amount: totalPaid, balance_amount: balanceAmount, payment_status: paymentStatus };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getSaleStats(filters: SaleFilters = {}): Promise<SaleStats> {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('sale_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('sale_date', '<=', filters.date_to);
    }
    
    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) as total_sales'),
        db.raw('SUM(total_amount) as total_revenue'),
        db.raw('SUM(paid_amount) as total_collected'),
        db.raw('SUM(balance_amount) as total_outstanding'),
        db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as paid_count', ['paid']),
        db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as partially_paid_count', ['partially_paid']),
        db.raw('COUNT(CASE WHEN payment_status = ? THEN 1 END) as unpaid_count', ['unpaid']),
        db.raw('AVG(total_amount) as average_sale_amount')
      )
      .first();
    
    return stats;
  }

  static async getOverdueSales(): Promise<SaleData[]> {
    return await db(this.tableName)
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .where('sales.due_date', '<', new Date().toISOString().split('T')[0])
      .where('sales.payment_status', '!=', 'paid')
      .orderBy('sales.due_date', 'asc');
  }
}

export default Sale;