/**
 * Purchase Event Service
 * Handles purchase-related domain events and saga participation
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
  PurchaseCreatedPayload,
  PurchaseReceivedPayload,
  PaymentCreatedPayload
} from '../../shared/events/types';

export interface PurchaseReceiveInput {
  purchase_id: string;
  items: Array<{ product_id: string; quantity: number }>;
}

export class PurchaseEventService extends BaseEventService {
  constructor() {
    super('purchase-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for payment events
      { eventType: 'payment.completed', handler: this.handlePaymentCompleted },
      
      // Listen for supplier events
      { eventType: 'supplier.updated', handler: this.handleSupplierUpdated },
      { eventType: 'supplier.deleted', handler: this.handleSupplierDeleted },
    ];
  }

  // ============= Event Emitters =============

  emitPurchaseCreated(payload: PurchaseCreatedPayload): void {
    this.emit('purchase.created', payload);
  }

  emitPurchaseUpdated(payload: { purchase_id: string; changes: Record<string, any> }): void {
    this.emit('purchase.updated', payload);
  }

  emitPurchaseReceived(payload: PurchaseReceivedPayload): void {
    this.emit('purchase.received', payload);
  }

  emitPurchaseCancelled(payload: { purchase_id: string; supplier_id: string; reason: string }): void {
    this.emit('purchase.cancelled', payload);
  }

  emitPaymentAdded(payload: { purchase_id: string; amount: number; new_balance: number }): void {
    this.emit('purchase.payment.added', payload);
  }

  // ============= Saga Operations =============

  /**
   * Create a purchase receive saga for atomic receiving operations
   */
  createReceiveSaga(): SagaManager {
    const saga = createSagaManager({
      name: 'purchase-receive-saga',
      eventEmitter: this.eventEmitter,
    });

    // Step 1: Validate purchase order
    const validateStep: SagaStep<PurchaseReceiveInput, PurchaseReceiveInput & { validated: boolean }> = {
      name: 'validate_purchase',
      execute: async (input) => {
        // Would validate purchase exists and is in correct state
        return { ...input, validated: true };
      },
    };

    // Step 2: Update inventory
    const updateInventoryStep: SagaStep<PurchaseReceiveInput & { validated: boolean }, { inventory_updated: boolean; items: Array<{ product_id: string; quantity: number }> }> = {
      name: 'update_inventory',
      execute: async (input) => {
        // Would call inventory service to add stock
        return { inventory_updated: true, items: input.items };
      },
      compensate: async (input, output) => {
        // Would reverse inventory changes
        console.log(`[purchase-service] Compensating inventory update for purchase ${input.purchase_id}`);
      },
    };

    // Step 3: Update purchase status
    const updateStatusStep: SagaStep<{ inventory_updated: boolean; items: Array<{ product_id: string; quantity: number }> }, { purchase_id: string; status: string }> = {
      name: 'update_purchase_status',
      execute: async (input) => {
        // Would update purchase status to received
        return { purchase_id: 'xxx', status: 'received' };
      },
      compensate: async (_, output) => {
        // Would revert purchase status
        console.log(`[purchase-service] Compensating status update for purchase ${output.purchase_id}`);
      },
    };

    return saga
      .addStep(validateStep)
      .addStep(updateInventoryStep)
      .addStep(updateStatusStep);
  }

  // ============= Event Handlers =============

  private async handlePaymentCompleted(payload: EventPayload<PaymentCreatedPayload>): Promise<void> {
    console.log(`[purchase-service] Processing payment.completed: ${payload.data.payment_id}`);
    // Would check if payment is for a purchase and update balance
  }

  private async handleSupplierUpdated(payload: EventPayload<{ supplier_id: string }>): Promise<void> {
    console.log(`[purchase-service] Processing supplier.updated: ${payload.data.supplier_id}`);
    // Would update cached supplier info in purchases
  }

  private async handleSupplierDeleted(payload: EventPayload<{ supplier_id: string }>): Promise<void> {
    console.log(`[purchase-service] Processing supplier.deleted: ${payload.data.supplier_id}`);
    // Would handle orphaned purchases (block or archive)
  }
}

// Singleton instance
export const purchaseEventService = new PurchaseEventService();
