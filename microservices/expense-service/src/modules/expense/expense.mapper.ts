import { CreateExpenseDto, UpdateExpenseDto } from './dto';

/** Maps camelCase DTOs ↔ snake_case DB rows (SRP). */
export class ExpenseMapper {
  static toRow(dto: CreateExpenseDto, expenseNumber: string): Record<string, any> {
    return {
      expense_number: expenseNumber,
      expense_date: dto.expenseDate,
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category,
      amount: dto.amount,
      currency: dto.currency ?? 'SAR',
      status: 'pending',
      payment_method: dto.paymentMethod,
      vendor: dto.vendor ?? null,
      receipt_attached: false,
      notes: dto.notes ?? null,
    };
  }

  static updateToRow(dto: UpdateExpenseDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.expenseDate !== undefined) row.expense_date = dto.expenseDate;
    if (dto.title !== undefined) row.title = dto.title;
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.category !== undefined) row.category = dto.category;
    if (dto.amount !== undefined) row.amount = dto.amount;
    if (dto.paymentMethod !== undefined) row.payment_method = dto.paymentMethod;
    if (dto.vendor !== undefined) row.vendor = dto.vendor;
    if (dto.notes !== undefined) row.notes = dto.notes;
    return row;
  }
}
