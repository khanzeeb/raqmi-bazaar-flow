import {
  IsString, IsNumber, IsOptional, IsEnum, IsArray,
  ValidateNested, Min, IsInt, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───

export enum PurchaseStatus {
  PENDING = 'pending',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
}

// ─── Item DTOs ───

export class PurchaseItemDto {
  @IsString() productId: string;
  @IsString() @IsOptional() productName?: string;
  @IsString() @IsOptional() productSku?: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() @Min(1) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsNumber() @Min(0) @IsOptional() discountAmount?: number;
  @IsNumber() @Min(0) @IsOptional() taxAmount?: number;
  @IsNumber() @Min(0) lineTotal: number;
  @IsNumber() @Min(0) @IsOptional() receivedQuantity?: number;
}

// ─── Create / Update ───

export class CreatePurchaseDto {
  @IsString() supplierId: string;
  @IsDateString() @IsOptional() purchaseDate?: string;
  @IsDateString() @IsOptional() expectedDeliveryDate?: string;
  @IsNumber() @Min(0) subtotal: number;
  @IsNumber() @Min(0) @IsOptional() taxAmount?: number;
  @IsNumber() @Min(0) @IsOptional() discountAmount?: number;
  @IsNumber() @Min(0) totalAmount: number;
  @IsNumber() @Min(0) @IsOptional() paidAmount?: number;
  @IsString() @IsOptional() currency?: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() termsConditions?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => PurchaseItemDto)
  @IsOptional()
  items?: PurchaseItemDto[];
}

export class UpdatePurchaseDto {
  @IsString() @IsOptional() supplierId?: string;
  @IsDateString() @IsOptional() purchaseDate?: string;
  @IsDateString() @IsOptional() expectedDeliveryDate?: string;
  @IsNumber() @Min(0) @IsOptional() subtotal?: number;
  @IsNumber() @Min(0) @IsOptional() taxAmount?: number;
  @IsNumber() @Min(0) @IsOptional() discountAmount?: number;
  @IsNumber() @Min(0) @IsOptional() totalAmount?: number;
  @IsNumber() @Min(0) @IsOptional() paidAmount?: number;
  @IsString() @IsOptional() currency?: string;
  @IsEnum(PurchaseStatus) @IsOptional() status?: PurchaseStatus;
  @IsEnum(PaymentStatus) @IsOptional() paymentStatus?: PaymentStatus;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() termsConditions?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => PurchaseItemDto)
  @IsOptional()
  items?: PurchaseItemDto[];
}

// ─── Filters ───

export class PurchaseFiltersDto {
  @IsOptional() @IsEnum(PurchaseStatus) status?: PurchaseStatus;
  @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
  @IsOptional() @IsString() supplierId?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}

// ─── Domain Operations ───

export class UpdateStatusDto {
  @IsEnum(PurchaseStatus) status: PurchaseStatus;
}

export class ReceiveItemDto {
  @IsString() itemId: string;
  @IsNumber() @Min(0) receivedQuantity: number;
}

export class ReceivePurchaseDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReceiveItemDto)
  @IsOptional()
  items?: ReceiveItemDto[];
}

export class AddPaymentDto {
  @IsNumber() @Min(0.01) amount: number;
}
