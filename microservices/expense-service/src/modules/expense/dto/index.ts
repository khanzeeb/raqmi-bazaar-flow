import {
  IsString, IsNumber, IsOptional, IsEnum, IsDateString,
  Min, IsInt, IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───
export enum ExpenseCategory {
  OFFICE_SUPPLIES = 'office_supplies',
  UTILITIES = 'utilities',
  RENT = 'rent',
  MARKETING = 'marketing',
  TRAVEL = 'travel',
  MEALS = 'meals',
  SOFTWARE = 'software',
  EQUIPMENT = 'equipment',
  PROFESSIONAL_SERVICES = 'professional_services',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  OTHER = 'other',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
}

// ─── Create / Update ───
export class CreateExpenseDto {
  @IsDateString() expenseDate: string;
  @IsString() title: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(ExpenseCategory) category: ExpenseCategory;
  @IsNumber() @Min(0) amount: number;
  @IsString() @IsOptional() currency?: string;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @IsString() @IsOptional() vendor?: string;
  @IsString() @IsOptional() notes?: string;
}

export class UpdateExpenseDto {
  @IsDateString() @IsOptional() expenseDate?: string;
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(ExpenseCategory) @IsOptional() category?: ExpenseCategory;
  @IsNumber() @Min(0) @IsOptional() amount?: number;
  @IsEnum(PaymentMethod) @IsOptional() paymentMethod?: PaymentMethod;
  @IsString() @IsOptional() vendor?: string;
  @IsString() @IsOptional() notes?: string;
}

export class UpdateStatusDto {
  @IsEnum(ExpenseStatus) status: ExpenseStatus;
}

export class AttachReceiptDto {
  @IsString() receiptUrl: string;
}

// ─── Filters ───
export class ExpenseFiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(ExpenseCategory) category?: ExpenseCategory;
  @IsOptional() @IsEnum(ExpenseStatus) status?: ExpenseStatus;
  @IsOptional() @IsString() vendor?: string;
  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}
