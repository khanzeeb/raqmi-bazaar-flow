// Base Mapper - SOLID: Single Responsibility for data transformation
// DRY: Common transformation patterns reused across mappers
import { Decimal } from '@prisma/client/runtime/library';

export abstract class BaseMapper<TEntity, TData> {
  /**
   * Transform database entity to API response format
   */
  abstract toData(entity: TEntity): TData;

  /**
   * Transform multiple entities
   */
  toDataList(entities: TEntity[]): TData[] {
    return entities.map(entity => this.toData(entity));
  }

  // Common transformation helpers

  /**
   * Convert Decimal/string to number with default value
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
   * Ensure array with default empty
   */
  protected toArray<T>(value: T[] | null | undefined): T[] {
    return value ?? [];
  }

  /**
   * Ensure object with default empty
   */
  protected toObject<T extends Record<string, any>>(value: T | null | undefined): T {
    return value ?? ({} as T);
  }

  /**
   * Parse JSON safely
   */
  protected parseJson<T>(value: string | T | null | undefined, defaultValue: T): T {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return value;
  }

  /**
   * Format date to ISO string
   */
  protected toIsoDate(value: Date | null | undefined): string | null {
    if (!value) return null;
    return value.toISOString();
  }

  /**
   * Safely access nested property
   */
  protected get<T, K>(obj: T | null | undefined, accessor: (o: T) => K): K | undefined {
    if (obj === null || obj === undefined) return undefined;
    return accessor(obj);
  }
}

/**
 * Transformer utility for input data (DTO to Prisma format)
 */
export abstract class BaseTransformer<TInput> {
  /**
   * Transform input for create operation
   */
  abstract forCreate(data: TInput): any;

  /**
   * Transform input for update operation
   */
  abstract forUpdate(data: Partial<TInput>): any;

  // Common transformation helpers

  /**
   * Convert number to Decimal
   */
  protected toDecimal(value: number | undefined): Decimal | undefined {
    if (value === undefined) return undefined;
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
   * Apply conditional transformation
   */
  protected applyIf<T, R>(value: T | undefined, transform: (v: T) => R): R | undefined {
    if (value === undefined) return undefined;
    return transform(value);
  }
}
