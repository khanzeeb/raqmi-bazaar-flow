import {
  IsString, IsNumber, IsOptional, IsEnum, IsUUID,
  IsDateString, Min, MaxLength, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  MOBILE_PAYMENT = 'mobile_payment',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum AllocationTargetType {
  INVOICE = 'invoice',
  ORDER = 'order',
}

// ─── Payment ───

export class CreatePaymentDto {
  @IsUUID() customerId: string;
  @IsString() @MaxLength(200) customerName: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @IsDateString() paymentDate: string;
  @IsOptional() @IsString() @MaxLength(200) reference?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsString() @MaxLength(500) chequeImagePath?: string;
}

export class UpdatePaymentDto {
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsNumber() @Min(0.01) amount?: number;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsDateString() paymentDate?: string;
  @IsOptional() @IsString() @MaxLength(200) reference?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsEnum(PaymentStatus) status?: PaymentStatus;
}

export class CompletePaymentDto {
  @IsOptional() @IsUUID() approvedBy?: string;
}

export class AllocatePaymentDto {
  @IsUUID() paymentId: string;
  @IsEnum(AllocationTargetType) targetType: AllocationTargetType;
  @IsUUID() targetId: string;
  @IsNumber() @Min(0.01) amount: number;
}

// ─── Filters ───

export class PaymentFiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(PaymentStatus) status?: PaymentStatus;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}
