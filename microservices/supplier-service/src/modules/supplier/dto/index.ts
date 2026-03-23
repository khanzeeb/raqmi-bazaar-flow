import {
  IsString, IsNumber, IsOptional, IsEnum, IsEmail,
  IsBoolean, IsInt, Min, Max, MaxLength, MinLength,
  ValidateNested, IsArray, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  COD = 'cod',
  PREPAID = 'prepaid',
}

// ─── Create / Update Supplier ───

export class CreateSupplierDto {
  @IsString() @MinLength(2) @MaxLength(200)
  name: string;

  @IsOptional() @IsString() @MaxLength(200)
  contactPerson?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(50)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(500)
  address?: string;

  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @IsOptional() @IsString() @MaxLength(100)
  state?: string;

  @IsOptional() @IsString() @MaxLength(20)
  postalCode?: string;

  @IsOptional() @IsString() @MaxLength(5)
  country?: string;

  @IsOptional() @IsString() @MaxLength(50)
  taxId?: string;

  @IsOptional() @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional() @IsNumber() @Min(0)
  creditLimit?: number;

  @IsOptional() @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional() @IsString() @MaxLength(10)
  currency?: string;

  @IsOptional() @IsString() @MaxLength(500)
  website?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  notes?: string;
}

export class UpdateSupplierDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(200)
  name?: string;

  @IsOptional() @IsString() @MaxLength(200)
  contactPerson?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(50)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(500)
  address?: string;

  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @IsOptional() @IsString() @MaxLength(100)
  state?: string;

  @IsOptional() @IsString() @MaxLength(20)
  postalCode?: string;

  @IsOptional() @IsString() @MaxLength(5)
  country?: string;

  @IsOptional() @IsString() @MaxLength(50)
  taxId?: string;

  @IsOptional() @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional() @IsNumber() @Min(0)
  creditLimit?: number;

  @IsOptional() @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional() @IsString() @MaxLength(10)
  currency?: string;

  @IsOptional() @IsString() @MaxLength(500)
  website?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  notes?: string;
}

// ─── Filters ───

export class SupplierFiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(SupplierStatus) status?: SupplierStatus;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}

// ─── Supplier Contact ───

export class CreateSupplierContactDto {
  @IsString() @MinLength(2) @MaxLength(200)
  name: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(50)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(100)
  role?: string;

  @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateSupplierContactDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(200)
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(50)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(100)
  role?: string;

  @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}

// ─── Supplier Rating ───

export class CreateSupplierRatingDto {
  @IsInt() @Min(1) @Max(5)
  qualityScore: number;

  @IsInt() @Min(1) @Max(5)
  deliveryScore: number;

  @IsInt() @Min(1) @Max(5)
  pricingScore: number;

  @IsOptional() @IsString() @MaxLength(2000)
  comments?: string;

  @IsOptional() @IsString() @MaxLength(200)
  ratedBy?: string;
}

// ─── Supplier Purchases Filter ───

export class SupplierPurchasesFiltersDto {
  @IsOptional() @IsString() dateFrom?: string;
  @IsOptional() @IsString() dateTo?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
}
