import { BaseService } from '../common/BaseService';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { Expense, ExpenseCreateDTO, ExpenseUpdateDTO, ExpenseFilters } from '../models/Expense';
import { IExpenseService } from '../interfaces/IService';

export class ExpenseService extends BaseService<Expense, ExpenseCreateDTO, ExpenseUpdateDTO, ExpenseFilters> implements IExpenseService {
  private expenseRepository: ExpenseRepository;

  constructor() {
    const repository = new ExpenseRepository();
    super(repository);
    this.expenseRepository = repository;
  }

  protected getEntityName(): string {
    return 'Expense';
  }

  protected async validateCreateData(data: ExpenseCreateDTO): Promise<any> {
    const expenseNumber = await this.expenseRepository.generateExpenseNumber();
    
    return {
      ...data,
      expense_number: expenseNumber,
      currency: data.currency || 'SAR',
      status: 'pending',
      receipt_attached: false
    };
  }

  protected async validateUpdateData(data: ExpenseUpdateDTO): Promise<any> {
    return data;
  }

  protected async beforeDelete(expense: Expense): Promise<void> {
    if (expense.status === 'paid') {
      throw new Error('Cannot delete paid expenses');
    }
  }

  async updateStatus(id: string, status: string): Promise<Expense | null> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['approved', 'cancelled'],
      'approved': ['paid', 'cancelled'],
      'cancelled': ['pending'],
      'paid': [] // Cannot change from paid
    };

    if (!validTransitions[expense.status]?.includes(status)) {
      throw new Error(`Cannot change status from ${expense.status} to ${status}`);
    }

    return await this.expenseRepository.updateStatus(id, status);
  }

  async approve(id: string): Promise<Expense | null> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }

    if (expense.status !== 'pending') {
      throw new Error('Only pending expenses can be approved');
    }

    return await this.updateStatus(id, 'approved');
  }

  async attachReceipt(id: string, receiptUrl: string): Promise<Expense | null> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }

    return await this.expenseRepository.attachReceipt(id, receiptUrl);
  }

  async getStats(filters: ExpenseFilters = {}): Promise<any> {
    return await this.expenseRepository.getStats(filters);
  }

  async getByCategory(filters: ExpenseFilters = {}): Promise<any[]> {
    return await this.expenseRepository.getByCategory(filters);
  }
}
