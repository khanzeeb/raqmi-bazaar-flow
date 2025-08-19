import { BaseRepository } from '../common/BaseRepository';
import { IPaymentRepository } from '../interfaces/IRepository';

export interface Payment {
  id: string;
  payment_number: string;
  customer_id: string;
  amount: number;
  payment_method_code: string;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  notes?: string;
  allocated_amount: number;
  unallocated_amount: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentFilters {
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

export class PaymentRepository extends BaseRepository<Payment, PaymentFilters> implements IPaymentRepository {
  protected tableName = 'payments';

  protected buildFindAllQuery(filters: PaymentFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .leftJoin('payment_methods', 'payments.payment_method_code', 'payment_methods.code')
      .select(
        'payments.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'payment_methods.name as payment_method_name'
      );

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
      this.applySearchFilter(query, filters.search, [
        'payments.payment_number',
        'payments.reference',
        'customers.name',
        'customers.email'
      ]);
    }

    this.applySorting(query, filters.sortBy, filters.sortOrder);

    return query;
  }

  protected buildCountQuery(filters: PaymentFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .leftJoin('payment_methods', 'payments.payment_method_code', 'payment_methods.code')
      .count('payments.id as count');

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
      this.applySearchFilter(query, filters.search, [
        'payments.payment_number',
        'payments.reference',
        'customers.name',
        'customers.email'
      ]);
    }

    return query;
  }

  async findByCustomerId(customerId: string): Promise<Payment[]> {
    return await this.db(this.tableName)
      .leftJoin('payment_methods', 'payments.payment_method_code', 'payment_methods.code')
      .select(
        'payments.*',
        'payment_methods.name as payment_method_name'
      )
      .where('payments.customer_id', customerId)
      .orderBy('payments.payment_date', 'desc');
  }

  async allocateToOrder(paymentId: string, orderId: string, orderType: string, amount: number): Promise<any> {
    const trx = await this.db.transaction();
    
    try {
      // Create allocation
      const allocation = await trx('payment_allocations').insert({
        payment_id: paymentId,
        order_id: orderId,
        order_type: orderType,
        allocated_amount: amount,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      // Update payment allocated/unallocated amounts
      const payment = await this.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const newAllocatedAmount = payment.allocated_amount + amount;
      const newUnallocatedAmount = payment.amount - newAllocatedAmount;

      await trx(this.tableName)
        .where('id', paymentId)
        .update({
          allocated_amount: newAllocatedAmount,
          unallocated_amount: newUnallocatedAmount,
          updated_at: new Date()
        });

      await trx.commit();
      return allocation[0];
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getUnallocatedAmount(paymentId: string): Promise<number> {
    const payment = await this.findById(paymentId);
    return payment ? payment.unallocated_amount : 0;
  }

  async generatePaymentNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PAY-${year}${month}`;

    const lastPayment = await this.db(this.tableName)
      .where('payment_number', 'like', `${prefix}%`)
      .orderBy('payment_number', 'desc')
      .first();

    let nextNumber = 1;
    if (lastPayment) {
      const lastNumber = parseInt(lastPayment.payment_number.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getPaymentStats(filters?: PaymentFilters): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }

    if (filters?.date_from) {
      query = query.where('payment_date', '>=', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.where('payment_date', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_payments'),
        this.db.raw('SUM(amount) as total_amount'),
        this.db.raw('SUM(allocated_amount) as total_allocated'),
        this.db.raw('SUM(unallocated_amount) as total_unallocated'),
        this.db.raw('AVG(amount) as average_payment_amount'),
        this.db.raw("COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments"),
        this.db.raw("COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments")
      )
      .first();

    return stats;
  }
}