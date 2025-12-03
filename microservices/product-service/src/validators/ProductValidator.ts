// Product Validator - Single Responsibility: Validation logic only

import { CreateProductDTO, UpdateProductDTO, UpdateStockDTO } from '../dto/ProductDTO';

export class ProductValidator {
  /**
   * Validate create product data
   */
  validateCreate(data: CreateProductDTO): void {
    this.validateRequired(data.name, 'Name');
    this.validateRequired(data.sku, 'SKU');
    this.validatePrice(data.price);
    this.validateCost(data.cost);
    
    if (data.stock !== undefined) {
      this.validateStock(data.stock);
    }
    
    if (data.variants?.length) {
      data.variants.forEach((variant, index) => {
        this.validateVariant(variant, index);
      });
    }
  }

  /**
   * Validate update product data
   */
  validateUpdate(data: UpdateProductDTO): void {
    if (data.price !== undefined) {
      this.validatePrice(data.price);
    }
    
    if (data.cost !== undefined) {
      this.validateCost(data.cost);
    }
    
    if (data.stock !== undefined) {
      this.validateStock(data.stock);
    }
    
    if (data.variants?.length) {
      data.variants.forEach((variant, index) => {
        this.validateVariant(variant, index);
      });
    }
  }

  /**
   * Validate stock update data
   */
  validateStockUpdate(data: UpdateStockDTO): void {
    this.validateStock(data.stock);
  }

  /**
   * Validate required field
   */
  private validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Validate price
   */
  private validatePrice(price: number): void {
    if (typeof price !== 'number' || price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }
  }

  /**
   * Validate cost
   */
  private validateCost(cost: number): void {
    if (typeof cost !== 'number' || cost < 0) {
      throw new ValidationError('Cost cannot be negative');
    }
  }

  /**
   * Validate stock
   */
  private validateStock(stock: number): void {
    if (typeof stock !== 'number' || stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }
  }

  /**
   * Validate variant data
   */
  private validateVariant(variant: any, index: number): void {
    if (!variant.name) {
      throw new ValidationError(`Variant ${index + 1}: Name is required`);
    }
    if (!variant.sku) {
      throw new ValidationError(`Variant ${index + 1}: SKU is required`);
    }
    if (variant.price !== undefined && variant.price <= 0) {
      throw new ValidationError(`Variant ${index + 1}: Price must be greater than 0`);
    }
    if (variant.cost !== undefined && variant.cost < 0) {
      throw new ValidationError(`Variant ${index + 1}: Cost cannot be negative`);
    }
  }
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
