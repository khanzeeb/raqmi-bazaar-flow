// Base Transformer - SOLID: Single Responsibility for data transformation
// DRY: Common transformation patterns reused across transformers

import { Decimal } from '@prisma/client/runtime/library';

export abstract class BaseTransformer<TInput, TOutput> {
  /**
   * Transform input for create operation (DTO → Prisma format)
   */
  abstract forCreate(data: TInput): any;

  /**
   * Transform input for update operation (Partial DTO → Prisma format)
   */
  abstract forUpdate(data: Partial<TInput>): any;

  /**
   * Transform database entity to API response format
   */
  abstract toResponse(entity: any): TOutput;

  // Common transformation helpers for input (DTO → Prisma)

  /**
   * Convert number to Decimal
   */
  protected toDecimal(value: number | undefined): Decimal | undefined {
    if (value === undefined) return undefined;
    return new Decimal(value);
  }

  /**
   * Convert number to Decimal with required value
   */
  protected toDecimalRequired(value: number): Decimal {
    return new Decimal(value);
  }

  /**
   * Convert nullable number to Decimal
   */
  protected toNullableDecimal(value: number | null | undefined): Decimal | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Decimal(value);
  }

  /**
   * Normalize slug (lowercase, hyphens only)
   */
  protected normalizeSlug(value: string | undefined): string | undefined {
    if (value === undefined) return undefined;
    return value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  /**
   * Ensure array with default empty
   */
  protected ensureArray<T>(value: T[] | null | undefined): T[] {
    return value ?? [];
  }

  /**
   * Ensure object with default empty
   */
  protected ensureObject<T extends Record<string, any>>(value: T | null | undefined): T {
    return value ?? ({} as T);
  }

  // Common transformation helpers for output (Prisma → API)

  /**
   * Convert Decimal/string to number with default 0
   */
  protected toNumber(value: Decimal | string | number | null | undefined, defaultValue = 0): number {
    if (value === null || value === undefined) return defaultValue;
    return Number(value);
  }

  /**
   * Convert to nullable number
   */
  protected toNullableNumber(value: Decimal | string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    return Number(value);
  }

  /**
   * Apply conditional transformation for updates
   */
  protected applyIf<T, R>(value: T | undefined, transform: (v: T) => R): R | undefined {
    if (value === undefined) return undefined;
    return transform(value);
  }
}
