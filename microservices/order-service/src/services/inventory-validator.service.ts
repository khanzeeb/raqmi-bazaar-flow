/**
 * Inventory Validator Service
 * Single Responsibility: Validate and manage inventory for sales
 * Dependency Inversion: Depends on abstractions (InventorySaga)
 */

import { IInventoryValidator } from '../interfaces/ISaleService';
import { SaleItemDTO } from '../dto';
import { InventoryValidationResultDTO } from '../dto/inventory.dto';
import { createInventorySaga, InventorySaga } from '../events/InventorySaga';
import { SaleEventEmitter } from '../events/sale.events';

export class InventoryValidatorService implements IInventoryValidator {
  private inventorySaga: InventorySaga;

  constructor() {
    this.inventorySaga = createInventorySaga();
  }

  /**
   * Validates inventory availability and reserves stock using the saga pattern.
   * Emits saga lifecycle events for tracking.
   */
  async validateInventory(items: SaleItemDTO[]): Promise<InventoryValidationResultDTO> {
    const saga = createInventorySaga();
    
    SaleEventEmitter.emitSagaStarted({
      action: 'validate_inventory',
      items_count: items.length,
    });

    const sagaItems = items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      tax_amount: item.tax_amount,
    }));

    const result = await saga.validateAndReserve(sagaItems);

    if (result.success) {
      SaleEventEmitter.emitSagaCompleted({
        action: 'validate_inventory',
        reservation_id: result.data?.reservation_id,
      });
    } else {
      SaleEventEmitter.emitSagaFailed({
        action: 'validate_inventory',
        errors: result.errors || [],
        compensated: result.compensated || false,
      });
    }

    return result.data || {
      success: false,
      items: sagaItems,
      unavailable_items: [],
    };
  }

  /**
   * Check inventory without reserving (read-only check)
   */
  async checkInventoryOnly(items: SaleItemDTO[]): Promise<{
    available: boolean;
    items: Array<{
      product_id: string;
      requested_quantity: number;
      available_quantity: number;
      is_available: boolean;
    }>;
  }> {
    const saga = createInventorySaga();
    
    const sagaItems = items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      tax_amount: item.tax_amount,
    }));

    const result = await saga.checkOnly(sagaItems);
    
    return {
      available: result.available,
      items: result.items,
    };
  }
}
