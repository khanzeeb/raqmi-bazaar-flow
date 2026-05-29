import { Injectable } from '@nestjs/common';

/**
 * Shared bidirectional case-mapper.
 * camelCase DTO -> snake_case row, and snake_case row -> camelCase DTO.
 * Subclass to override or extend with domain-specific transforms (OCP).
 */
@Injectable()
export class BaseMapper {
  /** camelCase -> snake_case (skips `undefined` values). */
  public toRow(dto: Record<string, any>): Record<string, any> {
    return Object.entries(dto).reduce((acc, [key, value]) => {
      if (value === undefined) return acc;
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      acc[snakeKey] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  /** snake_case -> camelCase. */
  public toDto(row: Record<string, any>): Record<string, any> {
    if (!row) return row;
    return Object.entries(row).reduce((acc, [key, value]) => {
      const camelKey = key.replace(
        /_([a-z])/g,
        (_, letter) => letter.toUpperCase(),
      );
      acc[camelKey] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  /** Convenience for collections. */
  public toDtoMany(rows: Record<string, any>[]): Record<string, any>[] {
    return (rows ?? []).map((r) => this.toDto(r));
  }
}
