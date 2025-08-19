import { BaseRepository } from '../common/BaseRepository';

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  order_id: string;
  order_type: 'invoice' | 'sale' | 'quotation';
  order_number: string;
  allocated_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentAllocationFilters {
  payment_id?: string;
  order_id?: string;
  order_type?: string;
  page?: number;
  limit?: number;
}

export class PaymentAllocationRepository extends BaseRepository<PaymentAllocation, PaymentAllocationFilters> {
  protected tableName = 'payment_allocations';

  protected buildFindAllQuery(filters: PaymentAllocationFilters) {
    let query = this.db(this.tableName)
      .leftJoin('payments', 'payment_allocations.payment_id', 'payments.id')
      .leftJoin('customers', 'payments.customer_id', 'customers.id')
      .select(
        'payment_allocations.*',
        'payments.payment_number',
        'payments.payment_date',
        'payments.amount as payment_amount',
        'customers.name as customer_name'
      );

    if (filters.payment_id) {
      query = query.where('payment_allocations.payment_id', filters.payment_id);
    }

    if (filters.order_id) {
      query = query.where('payment_allocations.order_id', filters.order_id);
    }

    if (filters.order_type) {
      query = query.where('payment_allocations.order_type', filters.order_type);
    }

    return query.orderBy('payment_allocations.created_at', 'desc');
  }

  protected buildCountQuery(filters: PaymentAllocationFilters) {
    let query = this.db(this.tableName).count('id as count');

    if (filters.payment_id) {
      query = query.where('payment_id', filters.payment_id);
    }

    if (filters.order_id) {
      query = query.where('order_id', filters.order_id);
    }

    if (filters.order_type) {
      query = query.where('order_type', filters.order_type);
    }

    return query;
  }

  async findByPaymentId(paymentId: string): Promise<PaymentAllocation[]> {
    return await this.db(this.tableName)
      .where('payment_id', paymentId)
      .orderBy('created_at', 'desc');
  }

  async findByOrderId(orderId: string, orderType = 'sale'): Promise<PaymentAllocation[]> {
    return await this.db(this.tableName)
      .leftJoin('payments', 'payment_allocations.payment_id', 'payments.id')
      .select(
        'payment_allocations.*',
        'payments.payment_number',
        'payments.payment_date',
        'payments.amount as payment_amount'
      )
      .where('payment_allocations.order_id', orderId)
      .where('payment_allocations.order_type', orderType)
      .orderBy('payment_allocations.created_at', 'desc');
  }

  async createBulkAllocations(paymentId: string, allocations: Omit<PaymentAllocation, 'id' | 'payment_id' | 'created_at' | 'updated_at'>[]): Promise<PaymentAllocation[]> {
    const trx = await this.db.transaction();
    
    try {
      // Delete existing allocations for this payment
      await trx(this.tableName).where({ payment_id: paymentId }).del();
      
      // Insert new allocations
      const allocationsData = allocations.map(allocation => ({
        ...allocation,
        payment_id: paymentId,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const newAllocations = await trx(this.tableName)
        .insert(allocationsData)
        .returning('*');
      
      await trx.commit();
      return newAllocations;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getTotalAllocatedForOrder(orderId: string, orderType = 'sale'): Promise<number> {
    const result = await this.db(this.tableName)
      .where('order_id', orderId)
      .where('order_type', orderType)
      .sum('allocated_amount as total')
      .first();

    return parseFloat(result?.total || '0');
  }

  async deleteByPaymentId(paymentId: string): Promise<boolean> {
    const result = await this.db(this.tableName).where({ payment_id: paymentId }).del();
    return result > 0;
  }

  async deleteByOrderId(orderId: string, orderType = 'sale'): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where({ order_id: orderId, order_type: orderType })
      .del();
    return result > 0;
  }

  async getAllocationStats(filters?: PaymentAllocationFilters): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.payment_id) {
      query = query.where('payment_id', filters.payment_id);
    }

    if (filters?.order_type) {
      query = query.where('order_type', filters.order_type);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_allocations'),
        this.db.raw('SUM(allocated_amount) as total_allocated'),
        this.db.raw('AVG(allocated_amount) as average_allocation'),
        this.db.raw("COUNT(CASE WHEN order_type = 'sale' THEN 1 END) as sale_allocations"),
        this.db.raw("COUNT(CASE WHEN order_type = 'invoice' THEN 1 END) as invoice_allocations")
      )
      .first();

    return stats;
  }
}