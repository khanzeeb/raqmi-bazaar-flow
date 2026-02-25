import {
  IsString, IsNumber, IsOptional, IsEnum, IsBoolean,
  IsDateString, IsArray, Min, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───
export enum PricingRuleType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  TIERED = 'tiered',
  BUNDLE = 'bundle',
}

export enum PricingRuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
}

// ─── Create / Update ───
export class CreatePricingRuleDto {
  @IsString() name: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(PricingRuleType) type: PricingRuleType;
  @IsNumber() @Min(0) value: number;
  @IsString() @IsOptional() productId?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() currency?: string;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsNumber() @IsOptional() minQuantity?: number;
  @IsNumber() @IsOptional() maxQuantity?: number;
  @IsNumber() @Min(0) @IsOptional() priority?: number;
}

export class UpdatePricingRuleDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(PricingRuleType) @IsOptional() type?: PricingRuleType;
  @IsNumber() @Min(0) @IsOptional() value?: number;
  @IsString() @IsOptional() productId?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsNumber() @IsOptional() minQuantity?: number;
  @IsNumber() @IsOptional() maxQuantity?: number;
  @IsNumber() @Min(0) @IsOptional() priority?: number;
}

// ─── Filters ───
export class PricingFiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(PricingRuleType) type?: PricingRuleType;
  @IsOptional() @IsEnum(PricingRuleStatus) status?: PricingRuleStatus;
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}

// ─── Calculate ───
export class CalculatePriceDto {
  @IsString() productId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsNumber() @Min(0) basePrice: number;
  @IsString() @IsOptional() customerId?: string;
}
