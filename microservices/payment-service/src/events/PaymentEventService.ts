/**
 * Payment Event Service
 */
import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload, SagaManager, SagaStep, PaymentCreatedPayload, PaymentAllocatedPayload, InvoiceCreatedPayload } from '../../shared/events/types';
import { createSagaManager } from '../../shared/events/SagaManager';

export class PaymentEventService extends BaseEventService {
  constructor() { super('payment-service'); }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      { eventType: 'invoice.created', handler: this.handleInvoiceCreated },
      { eventType: 'invoice.overdue', handler: this.handleInvoiceOverdue },
    ];
  }

  emitPaymentCreated(payload: PaymentCreatedPayload): void { this.emit('payment.created', payload); }
  emitPaymentCompleted(payload: PaymentCreatedPayload): void { this.emit('payment.completed', payload); }
  emitPaymentAllocated(payload: PaymentAllocatedPayload): void { this.emit('payment.allocated', payload); }
  emitPaymentCancelled(payload: { payment_id: string; reason: string }): void { this.emit('payment.cancelled', payload); }
  emitPaymentRefunded(payload: { payment_id: string; customer_id: string; amount: number }): void { this.emit('payment.refunded', payload); }

  createAllocationSaga(): SagaManager {
    const saga = createSagaManager({ name: 'payment-allocation-saga', eventEmitter: this.eventEmitter });
    const allocateStep: SagaStep<{ payment_id: string; invoice_id: string; amount: number }, { allocated: boolean }> = {
      name: 'allocate_payment',
      execute: async (input) => ({ allocated: true }),
      compensate: async (input) => { console.log(`[payment-service] Reversing allocation for ${input.payment_id}`); },
    };
    return saga.addStep(allocateStep);
  }

  private async handleInvoiceCreated(payload: EventPayload<InvoiceCreatedPayload>): Promise<void> {
    console.log(`[payment-service] Invoice created: ${payload.data.invoice_id}`);
  }

  private async handleInvoiceOverdue(payload: EventPayload<{ invoice_id: string }>): Promise<void> {
    console.log(`[payment-service] Invoice overdue: ${payload.data.invoice_id}`);
  }
}

export const paymentEventService = new PaymentEventService();
