/**
 * Quotation Event Service
 */
import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload, QuotationCreatedPayload, QuotationConvertedPayload, CustomerCreatedPayload } from '../../shared/events/types';

export class QuotationEventService extends BaseEventService {
  constructor() { super('quotation-service'); }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      { eventType: 'customer.created', handler: this.handleCustomerCreated },
      { eventType: 'product.updated', handler: this.handleProductUpdated },
    ];
  }

  emitQuotationCreated(payload: QuotationCreatedPayload): void { this.emit('quotation.created', payload); }
  emitQuotationSent(payload: { quotation_id: string }): void { this.emit('quotation.sent', payload); }
  emitQuotationAccepted(payload: { quotation_id: string }): void { this.emit('quotation.accepted', payload); }
  emitQuotationRejected(payload: { quotation_id: string; reason?: string }): void { this.emit('quotation.rejected', payload); }
  emitQuotationConverted(payload: QuotationConvertedPayload): void { this.emit('quotation.converted', payload); }

  private async handleCustomerCreated(payload: EventPayload<CustomerCreatedPayload>): Promise<void> {
    console.log(`[quotation-service] New customer: ${payload.data.customer_id}`);
  }

  private async handleProductUpdated(payload: EventPayload<{ product_id: string }>): Promise<void> {
    console.log(`[quotation-service] Product updated: ${payload.data.product_id}`);
  }
}

export const quotationEventService = new QuotationEventService();
