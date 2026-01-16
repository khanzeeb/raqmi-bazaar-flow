/**
 * Return Event Service
 * Handles return-related domain events and saga participation
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
  ReturnCreatedPayload,
  ReturnCompletedPayload,
  SaleCreatedPayload
} from '../../shared/events/types';

export interface ReturnProcessInput {
  return_id: string;
  sale_id: string;
  items: Array<{ product_id: string; quantity: number; unit_price: number }>;
  restock: boolean;
}

export class ReturnEventService extends BaseEventService {
  constructor() {
    super('return-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for sale events
      { eventType: 'sale.cancelled', handler: this.handleSaleCancelled },
      
      // Listen for inventory events
      { eventType: 'inventory.adjusted', handler: this.handleInventoryAdjusted },
    ];
  }

  // ============= Event Emitters =============

  emitReturnCreated(payload: ReturnCreatedPayload): void {
    this.emit('return.created', payload);
  }

  emitReturnApproved(payload: { return_id: string; approved_by?: string }): void {
    this.emit('return.approved', payload);
  }

  emitReturnRejected(payload: { return_id: string; rejected_by?: string; reason?: string }): void {
    this.emit('return.rejected', payload);
  }

  emitReturnCompleted(payload: ReturnCompletedPayload): void {
    this.emit('return.completed', payload);
  }

  emitReturnCancelled(payload: { return_id: string; reason?: string }): void {
    this.emit('return.cancelled', payload);
  }

  // ============= Saga Operations =============

  /**
   * Create a return processing saga for atomic return operations
   */
  createReturnSaga(): SagaManager {
    const saga = createSagaManager({
      name: 'return-process-saga',
      eventEmitter: this.eventEmitter,
    });

    // Step 1: Validate return request
    const validateStep: SagaStep<ReturnProcessInput, ReturnProcessInput & { valid: boolean }> = {
      name: 'validate_return',
      execute: async (input) => {
        // Would validate sale exists and items are returnable
        return { ...input, valid: true };
      },
    };

    // Step 2: Update inventory (if restocking)
    const restockStep: SagaStep<ReturnProcessInput & { valid: boolean }, { restocked: boolean; items: Array<{ product_id: string; quantity: number }> }> = {
      name: 'restock_inventory',
      execute: async (input) => {
        if (!input.restock) {
          return { restocked: false, items: [] };
        }
        // Would call inventory service to add stock
        return { restocked: true, items: input.items };
      },
      compensate: async (input, output) => {
        if (output.restocked) {
          // Would reverse inventory changes
          console.log(`[return-service] Compensating restock for return ${input.return_id}`);
        }
      },
    };

    // Step 3: Process refund
    const refundStep: SagaStep<{ restocked: boolean; items: Array<{ product_id: string; quantity: number }> }, { refund_amount: number; refund_id?: string }> = {
      name: 'process_refund',
      execute: async (input) => {
        // Would calculate and create refund
        const refundAmount = input.items.reduce((sum, item) => sum + item.quantity * 10, 0);
        return { refund_amount: refundAmount, refund_id: `ref-${Date.now()}` };
      },
      compensate: async (_, output) => {
        if (output.refund_id) {
          // Would void refund
          console.log(`[return-service] Compensating refund ${output.refund_id}`);
        }
      },
    };

    // Step 4: Complete return
    const completeStep: SagaStep<{ refund_amount: number; refund_id?: string }, { return_id: string; status: string }> = {
      name: 'complete_return',
      execute: async (input) => {
        return { return_id: 'xxx', status: 'completed' };
      },
      compensate: async (_, output) => {
        console.log(`[return-service] Reverting return ${output.return_id}`);
      },
    };

    return saga
      .addStep(validateStep)
      .addStep(restockStep)
      .addStep(refundStep)
      .addStep(completeStep);
  }

  // ============= Event Handlers =============

  private async handleSaleCancelled(payload: EventPayload<{ sale_id: string }>): Promise<void> {
    console.log(`[return-service] Processing sale.cancelled: ${payload.data.sale_id}`);
    // Would check for pending returns related to this sale
  }

  private async handleInventoryAdjusted(payload: EventPayload<{ product_id: string }>): Promise<void> {
    console.log(`[return-service] Processing inventory.adjusted: ${payload.data.product_id}`);
    // Log for audit purposes
  }
}

// Singleton instance
export const returnEventService = new ReturnEventService();
