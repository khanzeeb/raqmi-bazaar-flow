import {
  IsString, IsNumber, IsOptional, IsEnum, IsInt, Min,
  IsArray, ValidateNested, IsUUID, IsDateString, ArrayMinSize, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───

export enum ReturnType {
  FULL = 'full',
  PARTIAL = 'partial',
}

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_NEEDED = 'not_needed',
  DAMAGED = 'damaged',
  OTHER = 'other',
}

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
}

export enum ItemCondition {
  GOOD = 'good',
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
  UNOPENED = 'unopened',
}

// ─── Return Item ───

export class CreateReturnItemDto {
  @IsUUID() saleItemId: string;
  @IsUUID() productId: string;
  @IsString() @MaxLength(200) productName: string;
  @IsOptional() @IsString() @MaxLength(100) productSku?: string;
  @IsInt() @Min(1) quantityReturned: number;
  @IsInt() @Min(1) originalQuantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsEnum(ItemCondition) condition: ItemCondition;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

// ─── Return ───

export class CreateReturnDto {
  @IsUUID() saleId: string;
  @IsUUID() customerId: string;
  @IsDateString() returnDate: string;
  @IsEnum(ReturnType) returnType: ReturnType;
  @IsEnum(ReturnReason) reason: ReturnReason;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;

  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items: CreateReturnItemDto[];
}

export class UpdateReturnDto {
  @IsOptional() @IsDateString() returnDate?: string;
  @IsOptional() @IsEnum(ReturnType) returnType?: ReturnType;
  @IsOptional() @IsEnum(ReturnReason) reason?: ReturnReason;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsEnum(ReturnStatus) status?: ReturnStatus;
  @IsOptional() @IsEnum(RefundStatus) refundStatus?: RefundStatus;
}

// ─── Process / Reject ───

export class ProcessReturnDto {
  @IsOptional() @IsNumber() @Min(0) refundAmount?: number;
  @IsOptional() @IsUUID() processedBy?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class RejectReturnDto {
  @IsOptional() @IsString() @MaxLength(2000) reason?: string;
  @IsOptional() @IsUUID() processedBy?: string;
}

// ─── Filters ───

export class ReturnFiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(ReturnStatus) status?: ReturnStatus;
  @IsOptional() @IsEnum(ReturnType) returnType?: ReturnType;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() saleId?: string;
  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}
