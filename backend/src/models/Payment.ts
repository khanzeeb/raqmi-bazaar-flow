import { Knex } from 'knex';
import db from '../config/database';

interface PaymentData {
  id?: string;
  payment_number?: string;
  customer_id: string;
  amount: number;
  payment_date: Date | string;
  payment_method_code: string;
  reference?: string;
  notes?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  allocated_amount?: number;
  unallocated_amount?: number;
  currency?: string;
  exchange_rate?: number;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  customer_name?: string;
  payment_method_name?: string;
}

interface PaymentFilters {
  customer_id?: string;
  status?: string;
  payment_method_code?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaymentStats {
  total_payments: number;
  completed_amount: number;
  pending_count: number;
  failed_count: number;
  average_payment: number;
  total_unallocated: number;
}

interface AllocationAmounts {
  allocated_amount: number;
  unallocated_amount: number;
}

class Payment {
  static get tableName(): string {
    return 'payments';
  }

  static async findById(id: string): Promise<PaymentData | undefined> {
    return await db(this.tableName)
      .select(
        'payments.*',
        'customers.name as customer_name',
        'payment_methods.name as payment_method_name'
      )
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .leftJoin('payment_methods', 'payments.payment_method_code', 'payment_methods.code')
      .where('payments.id', id)
      .first();
  }

  static async findByPaymentNumber(paymentNumber: string): Promise<PaymentData | undefined> {
    return await db(this.tableName)
      .select(
        'payments.*',
        'customers.name as customer_name',
        'payment_methods.name as payment_method_name'
      )
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .leftJoin('payment_methods', 'payments.payment_method_code', 'payment_methods.code')
      .where('payments.payment_number', paymentNumber)
      .first();
  }

  static async findAll(filters: PaymentFilters = {}) {
    let query = db(this.tableName)
      .select(
        'payments.*',
        'customers.name as customer_name',
        'payment_methods.name as payment_method_name'
      )
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .leftJoin('payment_methods', 'payments.payment_method_code', 'payment_methods.code');
    
    if (filters.customer_id) {
      query = query.where('payments.customer_id', filters.customer_id);
    }
    
    if (filters.status) {
      query = query.where('payments.status', filters.status);
    }
    
    if (filters.payment_method_code) {
      query = query.where('payments.payment_method_code', filters.payment_method_code);
    }
    
    if (filters.date_from) {
      query = query.where('payments.payment_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('payments.payment_date', '<=', filters.date_to);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('payments.payment_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`)
            .orWhere('payments.reference', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const payments = await query
      .orderBy(filters.sortBy || 'payments.created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: payments,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters: PaymentFilters = {}): Promise<number> {
    let query = db(this.tableName)
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .count('payments.id as count');
    
    if (filters.customer_id) {
      query = query.where('payments.customer_id', filters.customer_id);
    }
    
    if (filters.status) {
      query = query.where('payments.status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('payments.payment_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(paymentData: Omit<PaymentData, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentData> {
    const trx = await db.transaction();
    
    try {
      // Generate payment number if not provided
      if (!paymentData.payment_number) {
        paymentData.payment_number = await this.generatePaymentNumber();
      }
      
      // Calculate unallocated amount
      paymentData.unallocated_amount = paymentData.amount - (paymentData.allocated_amount || 0);
      
      const [payment] = await trx(this.tableName)
        .insert({
          ...paymentData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      await trx.commit();
      return payment;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: string, paymentData: Partial<PaymentData>): Promise<PaymentData> {
    const trx = await db.transaction();
    
    try {
      // Recalculate unallocated amount if amount changed
      if (paymentData.amount !== undefined) {
        const currentPayment = await trx(this.tableName).where({ id }).first();
        paymentData.unallocated_amount = paymentData.amount - (currentPayment.allocated_amount || 0);
      }
      
      const [payment] = await trx(this.tableName)
        .where({ id })
        .update({
          ...paymentData,
          updated_at: new Date()
        })
        .returning('*');
      
      await trx.commit();
      return payment;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: string): Promise<number> {
    const trx = await db.transaction();
    
    try {
      // Delete related allocations first
      await trx('payment_allocations').where({ payment_id: id }).del();
      
      // Delete the payment
      const result = await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async generatePaymentNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `PAY-${year}${month}`;
    
    const lastPayment = await db(this.tableName)
      .where('payment_number', 'like', `${prefix}%`)
      .orderBy('payment_number', 'desc')
      .first();
    
    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.payment_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async getPaymentStats(filters: PaymentFilters = {}): Promise<PaymentStats> {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('payment_date', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('payment_date', '<=', filters.date_to);
    }
    
    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) as total_payments'),
        db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as completed_amount', ['completed']),
        db.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_count', ['pending']),
        db.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as failed_count', ['failed']),
        db.raw('AVG(amount) as average_payment'),
        db.raw('SUM(unallocated_amount) as total_unallocated')
      )
      .first();
    
    return stats;
  }

  static async updateAllocationAmounts(paymentId: string): Promise<AllocationAmounts> {
    const trx = await db.transaction();
    
    try {
      // Calculate total allocated amount
      const allocationsSum = await trx('payment_allocations')
        .where({ payment_id: paymentId })
        .sum('allocated_amount as total')
        .first();
      
      const totalAllocated = parseFloat(allocationsSum.total) || 0;
      
      // Get payment amount
      const payment = await trx(this.tableName).where({ id: paymentId }).first();
      const unallocatedAmount = payment.amount - totalAllocated;
      
      // Update payment allocation amounts
      await trx(this.tableName)
        .where({ id: paymentId })
        .update({
          allocated_amount: totalAllocated,
          unallocated_amount: unallocatedAmount,
          updated_at: new Date()
        });
      
      await trx.commit();
      return { allocated_amount: totalAllocated, unallocated_amount: unallocatedAmount };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

export default Payment;