// Product Validator - SOLID: Single Responsibility for product validation
import { BaseValidator, ValidationError } from '../common/BaseValidator';
import { CreateProductDTO, UpdateProductDTO, UpdateStockDTO, CreateVariantDTO } from '../dto';

export { ValidationError };

export class ProductValidator extends BaseValidator<CreateProductDTO, UpdateProductDTO> {
  /**
   * Validate create product data
   */
  validateCreate(data: CreateProductDTO): void {
    this.validateRequired(data.name, 'Name');
    this.validateRequired(data.sku, 'SKU');
    this.validatePositive(data.price, 'Price');
    this.validateNonNegative(data.cost, 'Cost');
    this.validateNonNegative(data.stock, 'Stock');
    
    if (data.variants?.length) {
      this.validateVariants(data.variants);
    }
  }

  /**
   * Validate update product data
   */
  validateUpdate(data: UpdateProductDTO): void {
    this.validateNonEmpty(data.name, 'Name');
    this.validateNonEmpty(data.sku, 'SKU');
    this.validatePositive(data.price, 'Price');
    this.validateNonNegative(data.cost, 'Cost');
    this.validateNonNegative(data.stock, 'Stock');
    
    if (data.variants?.length) {
      this.validateVariants(data.variants);
    }
  }

  /**
   * Validate stock update
   */
  validateStockUpdate(data: UpdateStockDTO): void {
    this.validateNonNegative(data.stock, 'Stock');
  }

  /**
   * Validate variants array
   */
  private validateVariants(variants: CreateVariantDTO[]): void {
    variants.forEach((variant, index) => {
      const prefix = `Variant ${index + 1}`;
      
      if (!variant.name) {
        throw new ValidationError(`${prefix}: Name is required`, 'variants');
      }
      if (variant.price !== undefined && variant.price <= 0) {
        throw new ValidationError(`${prefix}: Price must be greater than 0`, 'variants');
      }
      if (variant.cost !== undefined && variant.cost < 0) {
        throw new ValidationError(`${prefix}: Cost cannot be negative`, 'variants');
      }
    });
  }
}
