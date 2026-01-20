// Base Validator - SOLID: Single Responsibility for validation
// DRY: Common validation patterns reused across validators

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: any, data: T) => boolean;
  message: string;
}

export class ValidationError extends Error {
  public readonly field?: string;
  public readonly statusCode = 400;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export abstract class BaseValidator<TCreate, TUpdate = Partial<TCreate>> {
  /**
   * Validate create data
   */
  abstract validateCreate(data: TCreate): void;

  /**
   * Validate update data
   */
  abstract validateUpdate(data: TUpdate): void;

  // Common validation helpers

  /**
   * Validate required field
   */
  protected validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate non-empty string
   */
  protected validateNonEmpty(value: string | undefined, fieldName: string): void {
    if (value !== undefined && value.trim().length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate positive number (> 0)
   */
  protected validatePositive(value: number | undefined, fieldName: string): void {
    if (value !== undefined && (typeof value !== 'number' || value <= 0)) {
      throw new ValidationError(`${fieldName} must be greater than 0`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate non-negative number (>= 0)
   */
  protected validateNonNegative(value: number | undefined, fieldName: string): void {
    if (value !== undefined && (typeof value !== 'number' || value < 0)) {
      throw new ValidationError(`${fieldName} cannot be negative`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate minimum length
   */
  protected validateMinLength(value: string | undefined, minLength: number, fieldName: string): void {
    if (value !== undefined && value.length < minLength) {
      throw new ValidationError(`${fieldName} must be at least ${minLength} characters`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate maximum length
   */
  protected validateMaxLength(value: string | undefined, maxLength: number, fieldName: string): void {
    if (value !== undefined && value.length > maxLength) {
      throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate enum value
   */
  protected validateEnum<E extends string>(value: E | undefined, allowedValues: E[], fieldName: string): void {
    if (value !== undefined && !allowedValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        fieldName.toLowerCase()
      );
    }
  }

  /**
   * Validate array not empty
   */
  protected validateArrayNotEmpty<T>(value: T[] | undefined, fieldName: string): void {
    if (value !== undefined && value.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName.toLowerCase());
    }
  }

  /**
   * Validate URL format
   */
  protected validateUrl(value: string | undefined, fieldName: string): void {
    if (value !== undefined) {
      try {
        new URL(value);
      } catch {
        throw new ValidationError(`${fieldName} must be a valid URL`, fieldName.toLowerCase());
      }
    }
  }

  /**
   * Validate slug format (lowercase, alphanumeric, hyphens)
   */
  protected validateSlug(value: string | undefined, fieldName: string): void {
    if (value !== undefined && !/^[a-z0-9-]+$/.test(value)) {
      throw new ValidationError(
        `${fieldName} must contain only lowercase letters, numbers, and hyphens`,
        fieldName.toLowerCase()
      );
    }
  }
}
