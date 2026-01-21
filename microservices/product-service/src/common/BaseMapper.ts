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
