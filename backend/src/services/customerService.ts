import Customer from '../models/Customer';
import db from '../config/database';

interface CustomerData {
  id?: number;
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

interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  credit_status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class CustomerService {
  
  static async createCustomer(customerData: Partial<CustomerData>): Promise<CustomerData> {
    try {
      // Check if email already exists
      if (customerData.email) {
        const existingCustomer = await Customer.findByEmail(customerData.email);
        if (existingCustomer) {
          throw new Error('Customer with this email already exists');
        }
      }
      
      // Set default values
      const defaultValues: Partial<CustomerData> = {
        type: 'individual',
        status: 'active',
        credit_limit: 0,
        used_credit: 0,
        available_credit: 0,
        overdue_amount: 0,
        total_outstanding: 0,
        credit_status: 'good',
        payment_terms: 'net_30',
        preferred_language: 'en'
      };
      
      const customer = await Customer.create({
        ...defaultValues,
        ...customerData,
        available_credit: customerData.credit_limit || 0
      });
      
      return customer;
    } catch (error) {
      throw error;
    }
  }
  
  static async updateCustomer(customerId: string, customerData: Partial<CustomerData>): Promise<CustomerData> {
    try {
      const existingCustomer = await Customer.findById(customerId);
      if (!existingCustomer) {
        throw new Error('Customer not found');
      }
      
      // Check email uniqueness if email is being updated
      if (customerData.email && customerData.email !== existingCustomer.email) {
        const emailExists = await Customer.findByEmail(customerData.email);
        if (emailExists) {
          throw new Error('Customer with this email already exists');
        }
      }
      
      // Recalculate available credit if credit limit changes
      if (customerData.credit_limit !== undefined) {
        customerData.available_credit = Math.max(0, customerData.credit_limit - existingCustomer.used_credit);
        
        // Update credit status based on new limit
        customerData.credit_status = this.calculateCreditStatus(
          customerData.credit_limit,
          existingCustomer.used_credit,
          existingCustomer.overdue_amount
        );
      }
      
      const customer = await Customer.update(customerId, customerData);
      return customer;
    } catch (error) {
      throw error;
    }
  }
  
  static async getCustomerById(customerId: string): Promise<CustomerData & { statistics: any }> {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Get additional customer statistics
    const stats = await Customer.getCustomerStats(customerId);
    
    return {
      ...customer,
      statistics: stats
    };
  }
  
  static async getCustomers(filters: CustomerFilters = {}): Promise<any> {
    return await Customer.findAll(filters);
  }
  
  static async deleteCustomer(customerId: string): Promise<number> {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Check if customer has any outstanding payments or orders
    if (customer.total_outstanding > 0) {
      throw new Error('Cannot delete customer with outstanding balance');
    }
    
    // Check for related records (payments, orders, etc.)
    const paymentCount = await db('payments').where({ customer_id: customerId }).count('id as count').first();
    if (parseInt(paymentCount.count) > 0) {
      throw new Error('Cannot delete customer with payment history');
    }
    
    return await Customer.delete(customerId);
  }
  
  static async updateCustomerCredit(customerId: string, amount: number, type: 'add' | 'subtract', reason = ''): Promise<CustomerData> {
    const trx = await db.transaction();
    
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }
      
      const result = await Customer.updateCredit(customerId, amount, type);
      
      // Log the credit history
      await db('customer_credit_history').insert({
        customer_id: customerId,
        amount: amount,
        type: type,
        previous_credit: customer.used_credit,
        new_credit: result.used_credit,
        reason: reason,
        reference_type: 'manual_adjustment',
        created_at: new Date()
      });
      
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getCustomerCreditHistory(customerId: string, filters: any = {}): Promise<any> {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    let query = db('customer_credit_history')
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc');
    
    if (filters.type) {
      query = query.where('type', filters.type);
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const history = await query.limit(limit).offset(offset);
    const total = await db('customer_credit_history')
      .where({ customer_id: customerId })
      .count('id as count')
      .first();
    
    return {
      data: history,
      total: parseInt(total.count),
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(parseInt(total.count) / limit)
    };
  }
  
  static async getCustomerStats(customerId: string): Promise<any> {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return await Customer.getCustomerStats(customerId);
  }
  
  static async blockCustomer(customerId: string, reason = ''): Promise<CustomerData> {
    const customer = await this.updateCustomer(customerId, {
      status: 'blocked',
      credit_status: 'blocked'
    });
    
    // Log the blocking action
    await db('customer_credit_history').insert({
      customer_id: customerId,
      amount: 0,
      type: 'adjustment',
      previous_credit: customer.used_credit,
      new_credit: customer.used_credit,
      reason: `Customer blocked: ${reason}`,
      reference_type: 'status_change',
      created_at: new Date()
    });
    
    return customer;
  }
  
  static async unblockCustomer(customerId: string, reason = ''): Promise<CustomerData> {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    const newCreditStatus = this.calculateCreditStatus(
      customer.credit_limit,
      customer.used_credit,
      customer.overdue_amount
    );
    
    const updatedCustomer = await this.updateCustomer(customerId, {
      status: 'active',
      credit_status: newCreditStatus
    });
    
    // Log the unblocking action
    await db('customer_credit_history').insert({
      customer_id: customerId,
      amount: 0,
      type: 'adjustment',
      previous_credit: customer.used_credit,
      new_credit: customer.used_credit,
      reason: `Customer unblocked: ${reason}`,
      reference_type: 'status_change',
      created_at: new Date()
    });
    
    return updatedCustomer;
  }
  
  static calculateCreditStatus(creditLimit: number, usedCredit: number, overdueAmount: number): 'good' | 'warning' | 'blocked' {
    if (overdueAmount > 0) {
      return 'blocked';
    }
    
    if (creditLimit > 0) {
      const utilizationRate = (usedCredit / creditLimit) * 100;
      if (utilizationRate >= 90) {
        return 'blocked';
      } else if (utilizationRate >= 75) {
        return 'warning';
      }
    }
    
    return 'good';
  }
  
  static async getCustomersByStatus(status: string): Promise<any> {
    return await Customer.findAll({ status });
  }
  
  static async getCustomersByCreditStatus(creditStatus: string): Promise<any> {
    return await Customer.findAll({ credit_status: creditStatus });
  }
  
  static async generateCustomerReport(filters: any = {}): Promise<any> {
    const customers = await Customer.findAll({ ...filters, limit: 1000 });
    
    const summary = {
      total_customers: customers.total,
      active_customers: customers.data.filter((c: any) => c.status === 'active').length,
      blocked_customers: customers.data.filter((c: any) => c.status === 'blocked').length,
      total_credit_limit: customers.data.reduce((sum: number, c: any) => sum + (c.credit_limit || 0), 0),
      total_used_credit: customers.data.reduce((sum: number, c: any) => sum + (c.used_credit || 0), 0),
      total_outstanding: customers.data.reduce((sum: number, c: any) => sum + (c.total_outstanding || 0), 0)
    };
    
    return {
      customers: customers.data,
      summary
    };
  }
  
  static async processOverdueCustomers(): Promise<number> {
    // Find customers with overdue amounts and update their status
    const overdueCustomers = await db('customers')
      .where('overdue_amount', '>', 0)
      .where('credit_status', '!=', 'blocked');
    
    for (const customer of overdueCustomers) {
      await this.updateCustomer(customer.id, {
        credit_status: 'blocked'
      });
    }
    
    return overdueCustomers.length;
  }
}

export default CustomerService;