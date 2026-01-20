// Variant Validator - SOLID: Single Responsibility for variant validation
import { BaseValidator } from '../common/BaseValidator';
import { CreateVariantDTO, UpdateVariantDTO } from '../dto';

export class VariantValidator extends BaseValidator<CreateVariantDTO, UpdateVariantDTO> {
  /**
   * Validate create variant data
   */
  validateCreate(data: CreateVariantDTO): void {
    this.validateRequired(data.name, 'Name');
    this.validatePositive(data.price, 'Price');
    this.validateNonNegative(data.cost, 'Cost');
    this.validateNonNegative(data.stock, 'Stock');
  }

  /**
   * Validate update variant data
   */
  validateUpdate(data: UpdateVariantDTO): void {
    this.validateNonEmpty(data.name, 'Name');
    this.validatePositive(data.price, 'Price');
    this.validateNonNegative(data.cost, 'Cost');
    this.validateNonNegative(data.stock, 'Stock');
  }
}
