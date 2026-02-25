import {
  IsString, IsNumber, IsOptional, IsEnum, IsArray,
  ValidateNested, Min, IsInt, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enums ───
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
}

// ─── Create / Update ───
export class CreateInventoryDto {
  @IsString() productId: string;
  @IsString() productName: string;
  @IsString() sku: string;
  @IsString() @IsOptional() category?: string;
  @IsNumber() @Min(0) currentStock: number;
  @IsNumber() @Min(0) @IsOptional() minimumStock?: number;
  @IsNumber() @Min(0) @IsOptional() maximumStock?: number;
  @IsNumber() @Min(0) @IsOptional() unitCost?: number;
  @IsNumber() @Min(0) @IsOptional() unitPrice?: number;
  @IsString() @IsOptional() location?: string;
  @IsString() @IsOptional() supplier?: string;
  @IsString() @IsOptional() notes?: string;
}

export class UpdateInventoryDto {
  @IsString() @IsOptional() productName?: string;
  @IsString() @IsOptional() sku?: string;
  @IsString() @IsOptional() category?: string;
  @IsNumber() @Min(0) @IsOptional() currentStock?: number;
  @IsNumber() @Min(0) @IsOptional() minimumStock?: number;
  @IsNumber() @Min(0) @IsOptional() maximumStock?: number;
  @IsNumber() @Min(0) @IsOptional() unitCost?: number;
  @IsNumber() @Min(0) @IsOptional() unitPrice?: number;
  @IsString() @IsOptional() location?: string;
  @IsString() @IsOptional() supplier?: string;
  @IsEnum(StockStatus) @IsOptional() status?: StockStatus;
  @IsString() @IsOptional() notes?: string;
}

// ─── Filters ───
export class InventoryFiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsEnum(StockStatus) status?: StockStatus;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() supplier?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}

// ─── Stock Operations ───
export class AdjustStockDto {
  @IsNumber() quantity: number; // positive = add, negative = subtract
  @IsString() reason: string;
}

export class TransferStockDto {
  @IsString() toLocation: string;
  @IsNumber() @Min(1) quantity: number;
  @IsString() @IsOptional() reason?: string;
}

// ─── Stock Check / Reserve (saga) ───
export class StockCheckItemDto {
  @IsString() product_id: string;
  @IsString() @IsOptional() product_name?: string;
  @IsNumber() @Min(1) quantity: number;
}

export class CheckStockDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => StockCheckItemDto)
  items: StockCheckItemDto[];
}

export class ReserveStockDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => StockCheckItemDto)
  items: StockCheckItemDto[];
  @IsString() @IsOptional() sale_id?: string;
}

export class ReleaseStockDto {
  @IsString() reservation_id: string;
  @IsString() @IsOptional() sale_id?: string;
}
