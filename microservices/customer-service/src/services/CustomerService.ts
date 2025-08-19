import { BaseService } from '../common/BaseService';
import { ICustomerService } from '../interfaces/IService';
import CustomerRepository from '../models/Customer';
import { CustomerData, CustomerFilters } from '../models/Customer';

export interface CreateCustomerDTO {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tax_number?: string;
  type?: 'individual' | 'business';
  status?: 'active' | 'inactive' | 'blocked';
  credit_limit?: number;
  payment_terms?: 'immediate' | 'net_7' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90';
  preferred_language?: 'en' | 'ar';
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {}

class CustomerService extends BaseService<CustomerData, CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters> implements ICustomerService {
  constructor() {
    super(CustomerRepository);
  }

  protected async validateCreateData(data: CreateCustomerDTO): Promise<any> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Customer name is required');
    }
    
    if (data.email) {
      const existingCustomer = await CustomerRepository.findByEmail(data.email);
      if (existingCustomer) {
        throw new Error('Customer with this email already exists');
      }
    }
    
    // Set default values
    const defaults = {
      type: 'individual',
      status: 'active',
      credit_limit: 0,
      used_credit: 0,
      available_credit: data.credit_limit || 0,
      overdue_amount: 0,
      total_outstanding: 0,
      credit_status: 'good',
      payment_terms: 'net_30',
      preferred_language: 'en'
    };
    
    return { ...defaults, ...data };
  }

  protected async validateUpdateData(data: UpdateCustomerDTO): Promise<any> {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Customer name cannot be empty');
    }
    
    if (data.email) {
      const existingCustomer = await CustomerRepository.findByEmail(data.email);
      if (existingCustomer) {
        throw new Error('Customer with this email already exists');
      }
    }
    
    return data;
  }

  async updateCredit(id: string, amount: number, type: 'add' | 'subtract' = 'add', reason = ''): Promise<CustomerData | null> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    const result = await CustomerRepository.updateCredit(id, amount, type);
    
    if (result && reason) {
      // Log credit history
      await CustomerRepository.db('customer_credit_history').insert({
        customer_id: id,
        amount,
        type,
        previous_credit: result.used_credit - (type === 'add' ? amount : -amount),
        new_credit: result.used_credit,
        reason,
        reference_type: 'manual_adjustment',
        created_at: new Date()
      });
    }
    
    return result;
  }

  async getCreditHistory(customerId: string, filters: any = {}): Promise<any> {
    const customer = await CustomerRepository.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    let query = CustomerRepository.db('customer_credit_history')
      .where({ customer_id: customerId })
      .orderBy('created_at', 'desc');
    
    if (filters.type) {
      query = query.where('type', filters.type);
    }
    
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const history = await query.limit(limit).offset(offset);
    const total = await CustomerRepository.db('customer_credit_history')
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

  async getCustomerStats(customerId: string): Promise<any> {
    const customer = await CustomerRepository.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return await CustomerRepository.getCustomerStats(customerId);
  }

  async blockCustomer(id: string, reason = ''): Promise<CustomerData | null> {
    const customer = await this.update(id, {
      status: 'blocked',
      credit_status: 'blocked'
    });
    
    if (customer && reason) {
      await CustomerRepository.db('customer_credit_history').insert({
        customer_id: id,
        amount: 0,
        type: 'subtract',
        previous_credit: customer.used_credit,
        new_credit: customer.used_credit,
        reason: `Customer blocked: ${reason}`,
        reference_type: 'status_change',
        created_at: new Date()
      });
    }
    
    return customer;
  }

  async unblockCustomer(id: string, reason = ''): Promise<CustomerData | null> {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      return null;
    }
    
    const newCreditStatus = this.calculateCreditStatus(
      customer.credit_limit,
      customer.used_credit,
      customer.overdue_amount
    );
    
    const updatedCustomer = await this.update(id, {
      status: 'active',
      credit_status: newCreditStatus
    });
    
    if (updatedCustomer && reason) {
      await CustomerRepository.db('customer_credit_history').insert({
        customer_id: id,
        amount: 0,
        type: 'add',
        previous_credit: customer.used_credit,
        new_credit: customer.used_credit,
        reason: `Customer unblocked: ${reason}`,
        reference_type: 'status_change',
        created_at: new Date()
      });
    }
    
    return updatedCustomer;
  }

  private calculateCreditStatus(creditLimit: number, usedCredit: number, overdueAmount: number): 'good' | 'warning' | 'blocked' {
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
}

export default new CustomerService();