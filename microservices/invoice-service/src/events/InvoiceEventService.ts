/**
 * Invoice Event Service
 */
import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload, SagaManager, createSagaManager, SagaStep, InvoiceCreatedPayload, InvoicePaidPayload, SaleCreatedPayload, PaymentAllocatedPayload } from '../../shared/events/types';
import { createSagaManager as createSaga } from '../../shared/events/SagaManager';

export class InvoiceEventService extends BaseEventService {
  constructor() { super('invoice-service'); }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      { eventType: 'sale.created', handler: this.handleSaleCreated },
      { eventType: 'payment.allocated', handler: this.handlePaymentAllocated },
    ];
  }

  emitInvoiceCreated(payload: InvoiceCreatedPayload): void { this.emit('invoice.created', payload); }
  emitInvoiceSent(payload: { invoice_id: string }): void { this.emit('invoice.sent', payload); }
  emitInvoicePaid(payload: InvoicePaidPayload): void { this.emit('invoice.paid', payload); }
  emitInvoiceOverdue(payload: { invoice_id: string; customer_id: string; days_overdue: number }): void { this.emit('invoice.overdue', payload); }

  private async handleSaleCreated(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[invoice-service] Auto-creating invoice for sale ${payload.data.sale_id}`);
  }

  private async handlePaymentAllocated(payload: EventPayload<PaymentAllocatedPayload>): Promise<void> {
    console.log(`[invoice-service] Processing payment allocation for invoice ${payload.data.invoice_id}`);
  }
}

export const invoiceEventService = new InvoiceEventService();
