/**
 * Product Event Service
 * Handles product-related domain events and saga participation
 */

import { 
  BaseEventService, 
  EventListenerConfig 
} from '../../shared/events/BaseEventService';
import { 
  SagaManager,
  createSagaManager
} from '../../shared/events/SagaManager';
import { 
  EventPayload,
  SagaStep,
  ProductCreatedPayload,
  ProductStockUpdatedPayload,
  PurchaseReceivedPayload,
  ReturnCompletedPayload,
  SaleCreatedPayload
} from '../../shared/events/types';

export class ProductEventService extends BaseEventService {
  private lowStockThreshold: number = 10;

  constructor() {
    super('product-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for purchase events to update stock
      { eventType: 'purchase.received', handler: this.handlePurchaseReceived },
      
      // Listen for return events to restock
      { eventType: 'return.completed', handler: this.handleReturnCompleted },
      
      // Listen for sale events to deduct stock
      { eventType: 'sale.created', handler: this.handleSaleCreated },
      { eventType: 'sale.cancelled', handler: this.handleSaleCancelled },
      
      // Listen for inventory adjustments
      { eventType: 'inventory.adjusted', handler: this.handleInventoryAdjusted },
    ];
  }

  // ============= Event Emitters =============

  emitProductCreated(payload: ProductCreatedPayload): void {
    this.emit('product.created', payload);
  }

  emitProductUpdated(payload: { product_id: string; changes: Record<string, any> }): void {
    this.emit('product.updated', payload);
  }

  emitProductDeleted(payload: { product_id: string }): void {
    this.emit('product.deleted', payload);
  }

  emitStockUpdated(payload: ProductStockUpdatedPayload): void {
    this.emit('product.stock.updated', payload);
    
    // Check for low stock
    if (payload.new_stock <= this.lowStockThreshold) {
      this.emit('product.low_stock', {
        product_id: payload.product_id,
        current_stock: payload.new_stock,
        threshold: this.lowStockThreshold,
      });
    }
  }

  emitLowStock(payload: { product_id: string; current_stock: number; threshold: number }): void {
    this.emit('product.low_stock', payload);
  }

  // ============= Saga Operations =============

  /**
   * Create a stock update saga for atomic stock operations
   */
  createStockUpdateSaga(): SagaManager {
    const saga = createSagaManager({
      name: 'product-stock-saga',
      eventEmitter: this.eventEmitter,
    });

    // Step 1: Validate stock operation
    const validateStep: SagaStep<{ product_id: string; adjustment: number }, { product_id: string; current_stock: number; adjustment: number }> = {
      name: 'validate_stock_operation',
      execute: async (input) => {
        // Would check if stock operation is valid (e.g., not going negative)
        return {
          product_id: input.product_id,
          current_stock: 100, // Would be from DB
          adjustment: input.adjustment,
        };
      },
    };

    // Step 2: Apply stock change
    const applyStep: SagaStep<{ product_id: string; current_stock: number; adjustment: number }, { product_id: string; new_stock: number }> = {
      name: 'apply_stock_change',
      execute: async (input) => {
        const newStock = input.current_stock + input.adjustment;
        // Would update DB
        return { product_id: input.product_id, new_stock: newStock };
      },
      compensate: async (input, _) => {
        // Reverse the stock change
        console.log(`[product-service] Compensating stock change for ${input.product_id}`);
      },
    };

    return saga.addStep(validateStep).addStep(applyStep);
  }

  // ============= Event Handlers =============

  private async handlePurchaseReceived(payload: EventPayload<PurchaseReceivedPayload>): Promise<void> {
    console.log(`[product-service] Processing purchase.received: ${payload.data.purchase_id}`);
    
    for (const item of payload.data.received_items) {
      // Would call ProductService to update stock
      this.emitStockUpdated({
        product_id: item.product_id,
        previous_stock: 0, // Would be actual
        new_stock: item.quantity, // Would be calculated
        reason: `Purchase received: ${payload.data.purchase_id}`,
      });
    }
  }

  private async handleReturnCompleted(payload: EventPayload<ReturnCompletedPayload>): Promise<void> {
    console.log(`[product-service] Processing return.completed: ${payload.data.return_id}`);
    if (payload.data.items_restocked) {
      // Stock already updated by return service
    }
  }

  private async handleSaleCreated(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[product-service] Processing sale.created: ${payload.data.sale_id}`);
    // Stock should already be reserved/deducted by inventory saga
  }

  private async handleSaleCancelled(payload: EventPayload<{ sale_id: string }>): Promise<void> {
    console.log(`[product-service] Processing sale.cancelled: ${payload.data.sale_id}`);
    // Would restore stock for cancelled sale items
  }

  private async handleInventoryAdjusted(payload: EventPayload<{ product_id: string; new_stock: number }>): Promise<void> {
    console.log(`[product-service] Processing inventory.adjusted: ${payload.data.product_id}`);
    // Sync product stock with inventory adjustment
  }
}

// Singleton instance
export const productEventService = new ProductEventService();
