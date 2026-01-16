import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, Length, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOrganizationDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsString()
  @Length(2, 100)
  slug: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  industry?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  taxNumber?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  timezone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'ar'])
  language?: string;

  // Address
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  @IsOptional()
  @IsString()
  addressState?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  addressCountry?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  addressPostal?: string;

  // Settings
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultTaxRate?: number;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  invoicePrefix?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  quotationPrefix?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  expensePrefix?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  purchasePrefix?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  fiscalYearStart?: number;

  // Owner info (for initial member creation)
  @IsString()
  ownerId: string;

  @IsString()
  ownerEmail: string;

  @IsString()
  ownerName: string;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class QueryOrganizationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
