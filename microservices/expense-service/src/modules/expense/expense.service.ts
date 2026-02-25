import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExpenseRepository } from './expense.repository';
import {
  CreateExpenseDto, UpdateExpenseDto, ExpenseFiltersDto, ExpenseStatus,
} from './dto';
import { ExpenseMapper } from './expense.mapper';

/** Valid status transitions. */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['approved', 'cancelled'],
  approved: ['paid', 'cancelled'],
  cancelled: ['pending'],
  paid: [],
};

@Injectable()
export class ExpenseService {
  constructor(private readonly repo: ExpenseRepository) {}

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Expense not found');
    return row;
  }

  async getAll(filters: ExpenseFiltersDto) {
    return this.repo.findAll(filters);
  }

  async create(dto: CreateExpenseDto) {
    const expenseNumber = await this.repo.generateExpenseNumber();
    return this.repo.create(ExpenseMapper.toRow(dto, expenseNumber));
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.getById(id);
    return this.repo.update(id, ExpenseMapper.updateToRow(dto));
  }

  async remove(id: string) {
    const expense = await this.getById(id);
    if (expense.status === 'paid') throw new BadRequestException('Cannot delete paid expenses');
    return this.repo.delete(id);
  }

  async updateStatus(id: string, newStatus: string) {
    const expense = await this.getById(id);
    const allowed = STATUS_TRANSITIONS[expense.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Cannot change status from ${expense.status} to ${newStatus}`);
    }
    return this.repo.update(id, { status: newStatus });
  }

  async approve(id: string) {
    return this.updateStatus(id, ExpenseStatus.APPROVED);
  }

  async attachReceipt(id: string, receiptUrl: string) {
    await this.getById(id);
    return this.repo.update(id, { receipt_url: receiptUrl, receipt_attached: true });
  }

  async getStats(filters: ExpenseFiltersDto = {}) {
    return this.repo.getStats(filters);
  }

  async getByCategory(filters: ExpenseFiltersDto = {}) {
    return this.repo.getByCategory(filters);
  }
}
