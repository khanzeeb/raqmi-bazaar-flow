/**
 * Customer Event Service
 * Handles customer-related domain events and saga participation
 */

import { 
  BaseEventService, 
  EventListenerConfig 
} from '../../shared/events/BaseEventService';
import { 
  EventPayload,
  CustomerCreatedPayload,
  CustomerCreditUpdatedPayload,
  SaleCreatedPayload,
  PaymentCreatedPayload
} from '../../shared/events/types';

export class CustomerEventService extends BaseEventService {
  constructor() {
    super('customer-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for sale events to update customer statistics
      { eventType: 'sale.created', handler: this.handleSaleCreated },
      { eventType: 'sale.completed', handler: this.handleSaleCompleted },
      { eventType: 'sale.cancelled', handler: this.handleSaleCancelled },
      
      // Listen for payment events to update credit
      { eventType: 'payment.completed', handler: this.handlePaymentCompleted },
      { eventType: 'payment.refunded', handler: this.handlePaymentRefunded },
      
      // Listen for invoice events
      { eventType: 'invoice.overdue', handler: this.handleInvoiceOverdue },
    ];
  }

  // ============= Event Emitters =============

  emitCustomerCreated(payload: CustomerCreatedPayload): void {
    this.emit('customer.created', payload);
  }

  emitCustomerUpdated(payload: { customer_id: string; changes: Record<string, any> }): void {
    this.emit('customer.updated', payload);
  }

  emitCustomerDeleted(payload: { customer_id: string }): void {
    this.emit('customer.deleted', payload);
  }

  emitCreditUpdated(payload: CustomerCreditUpdatedPayload): void {
    this.emit('customer.credit.updated', payload);
  }

  emitCustomerBlocked(payload: { customer_id: string; reason: string }): void {
    this.emit('customer.blocked', payload);
  }

  emitCustomerUnblocked(payload: { customer_id: string }): void {
    this.emit('customer.unblocked', payload);
  }

  // ============= Event Handlers =============

  private async handleSaleCreated(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[customer-service] Processing sale.created for customer ${payload.data.customer_id}`);
    // Update customer's order count and total spent
    // This would call the CustomerService to update statistics
  }

  private async handleSaleCompleted(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[customer-service] Processing sale.completed for customer ${payload.data.customer_id}`);
    // Update customer's completed orders count
  }

  private async handleSaleCancelled(payload: EventPayload<{ sale_id: string; customer_id: string }>): Promise<void> {
    console.log(`[customer-service] Processing sale.cancelled for sale ${payload.data.sale_id}`);
    // Update customer's cancelled orders count
  }

  private async handlePaymentCompleted(payload: EventPayload<PaymentCreatedPayload>): Promise<void> {
    console.log(`[customer-service] Processing payment.completed for customer ${payload.data.customer_id}`);
    // Reduce customer's outstanding balance
  }

  private async handlePaymentRefunded(payload: EventPayload<{ payment_id: string; customer_id: string; amount: number }>): Promise<void> {
    console.log(`[customer-service] Processing payment.refunded for ${payload.data.payment_id}`);
    // Increase customer's outstanding balance
  }

  private async handleInvoiceOverdue(payload: EventPayload<{ invoice_id: string; customer_id: string }>): Promise<void> {
    console.log(`[customer-service] Processing invoice.overdue for customer ${payload.data.customer_id}`);
    // Update customer's overdue amount and potentially block if exceeds threshold
  }
}

// Singleton instance
export const customerEventService = new CustomerEventService();
