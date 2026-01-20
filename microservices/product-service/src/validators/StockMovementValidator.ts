// Stock Movement Validator
import { BaseValidator } from '../common/BaseValidator';
import { CreateStockMovementDTO, UpdateStockMovementDTO, MovementType } from '../dto';

const MOVEMENT_TYPES: MovementType[] = ['purchase', 'sale', 'adjustment', 'return', 'transfer', 'damaged', 'expired'];

export class StockMovementValidator extends BaseValidator<CreateStockMovementDTO, UpdateStockMovementDTO> {
  /**
   * Validate create stock movement data
   */
  validateCreate(data: CreateStockMovementDTO): void {
    // Must have either product_id or product_variant_id
    if (!data.product_id && !data.product_variant_id) {
      throw new Error('Either product_id or product_variant_id is required');
    }
    
    this.validateRequired(data.type, 'Type');
    this.validateEnum(data.type, MOVEMENT_TYPES, 'Type');
    this.validateRequired(data.quantity, 'Quantity');
  }

  /**
   * Validate update stock movement data
   */
  validateUpdate(data: UpdateStockMovementDTO): void {
    if (data.type) {
      this.validateEnum(data.type, MOVEMENT_TYPES, 'Type');
    }
  }
}
