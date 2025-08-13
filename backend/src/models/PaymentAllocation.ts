import { Knex } from 'knex';
import db from '../config/database';
import Payment from './Payment';

interface PaymentAllocationData {
  id?: string;
  payment_id: string;
  order_id: string;
  order_type: 'invoice' | 'sale' | 'purchase';
  order_number?: string;
  allocated_amount: number;
  allocated_at?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  payment_number?: string;
  payment_date?: Date;
  customer_name?: string;
}

interface AllocationFilters {
  payment_id?: string;
  order_id?: string;
  order_type?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AllocationStats {
  total_allocations: number;
  total_allocated: number;
  average_allocation: number;
  payments_with_allocations: number;
  orders_with_payments: number;
}

class PaymentAllocation {
  static get tableName(): string {
    return 'payment_allocations';
  }

  static async findById(id: string): Promise<PaymentAllocationData | undefined> {
    return await db(this.tableName).where({ id }).first();
  }

  static async findByPaymentId(paymentId: string): Promise<PaymentAllocationData[]> {
    return await db(this.tableName)
      .where({ payment_id: paymentId })
      .orderBy('allocated_at', 'asc');
  }

  static async findByOrderId(orderId: string, orderType: string = 'invoice'): Promise<PaymentAllocationData[]> {
    return await db(this.tableName)
      .where({ order_id: orderId, order_type: orderType })
      .orderBy('allocated_at', 'asc');
  }

  static async findAll(filters: AllocationFilters = {}) {
    let query = db(this.tableName)
      .select(
        'payment_allocations.*',
        'payments.payment_number',
        'payments.payment_date',
        'customers.name as customer_name'
      )
      .leftJoin('payments', 'payment_allocations.payment_id', 'payments.id')
      .leftJoin('customers', 'payments.customer_id', 'customers.id');
    
    if (filters.payment_id) {
      query = query.where('payment_allocations.payment_id', filters.payment_id);
    }
    
    if (filters.order_id) {
      query = query.where('payment_allocations.order_id', filters.order_id);
    }
    
    if (filters.order_type) {
      query = query.where('payment_allocations.order_type', filters.order_type);
    }
    
    if (filters.customer_id) {
      query = query.where('payments.customer_id', filters.customer_id);
    }
    
    if (filters.date_from) {
      query = query.where('payment_allocations.allocated_at', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('payment_allocations.allocated_at', '<=', filters.date_to);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('payment_allocations.order_number', 'ilike', `%${filters.search}%`)
            .orWhere('payments.payment_number', 'ilike', `%${filters.search}%`);
      });
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const allocations = await query
      .orderBy(filters.sortBy || 'payment_allocations.allocated_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: allocations,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters: AllocationFilters = {}): Promise<number> {
    let query = db(this.tableName)
      .leftJoin('payments', 'payment_allocations.payment_id', 'payments.id')
      .count('payment_allocations.id as count');
    
    if (filters.payment_id) {
      query = query.where('payment_allocations.payment_id', filters.payment_id);
    }
    
    if (filters.order_id) {
      query = query.where('payment_allocations.order_id', filters.order_id);
    }
    
    if (filters.customer_id) {
      query = query.where('payments.customer_id', filters.customer_id);
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(allocationData: Omit<PaymentAllocationData, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentAllocationData> {
    const trx = await db.transaction();
    
    try {
      const [allocation] = await trx(this.tableName)
        .insert({
          ...allocationData,
          allocated_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      // Update payment allocation amounts
      await Payment.updateAllocationAmounts(allocation.payment_id);
      
      await trx.commit();
      return allocation;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: string, allocationData: Partial<PaymentAllocationData>): Promise<PaymentAllocationData> {
    const trx = await db.transaction();
    
    try {
      const [allocation] = await trx(this.tableName)
        .where({ id })
        .update({
          ...allocationData,
          updated_at: new Date()
        })
        .returning('*');
      
      // Update payment allocation amounts
      await Payment.updateAllocationAmounts(allocation.payment_id);
      
      await trx.commit();
      return allocation;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: string): Promise<number> {
    const trx = await db.transaction();
    
    try {
      const allocation = await trx(this.tableName).where({ id }).first();
      if (!allocation) {
        throw new Error('Allocation not found');
      }
      
      const result = await trx(this.tableName).where({ id }).del();
      
      // Update payment allocation amounts
      await Payment.updateAllocationAmounts(allocation.payment_id);
      
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async createBulkAllocations(paymentId: string, allocations: Omit<PaymentAllocationData, 'id' | 'payment_id' | 'created_at' | 'updated_at'>[]): Promise<PaymentAllocationData[]> {
    const trx = await db.transaction();
    
    try {
      // Delete existing allocations for this payment
      await trx(this.tableName).where({ payment_id: paymentId }).del();
      
      // Insert new allocations
      const allocationData = allocations.map(allocation => ({
        ...allocation,
        payment_id: paymentId,
        allocated_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const newAllocations = await trx(this.tableName)
        .insert(allocationData)
        .returning('*');
      
      // Update payment allocation amounts
      await Payment.updateAllocationAmounts(paymentId);
      
      await trx.commit();
      return newAllocations;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getTotalAllocatedForOrder(orderId: string, orderType: string = 'invoice'): Promise<number> {
    const result = await db(this.tableName)
      .where({ order_id: orderId, order_type: orderType })
      .sum('allocated_amount as total')
      .first();
    
    return parseFloat(result.total) || 0;
  }

  static async getAllocationStats(filters: AllocationFilters = {}): Promise<AllocationStats> {
    const baseQuery = db(this.tableName);
    
    if (filters.date_from) {
      baseQuery.where('allocated_at', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      baseQuery.where('allocated_at', '<=', filters.date_to);
    }
    
    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) as total_allocations'),
        db.raw('SUM(allocated_amount) as total_allocated'),
        db.raw('AVG(allocated_amount) as average_allocation'),
        db.raw('COUNT(DISTINCT payment_id) as payments_with_allocations'),
        db.raw('COUNT(DISTINCT order_id) as orders_with_payments')
      )
      .first();
    
    return stats;
  }

  static async getUnpaidOrders(customerId: string, orderType: string = 'invoice'): Promise<any[]> {
    // This would need to join with the actual order tables (invoices, sales_orders, etc.)
    // For now, returning a placeholder structure
    return [];
  }
}

export default PaymentAllocation;