/**
 * Report Event Service
 * Listens to domain events for report aggregation
 */
import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload, SaleCreatedPayload, PaymentCreatedPayload, ExpenseCreatedPayload, PurchaseCreatedPayload } from '../../shared/events/types';

export class ReportEventService extends BaseEventService {
  constructor() { super('report-service'); }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      { eventType: 'sale.created', handler: this.handleSaleCreated },
      { eventType: 'sale.completed', handler: this.handleSaleCompleted },
      { eventType: 'payment.completed', handler: this.handlePaymentCompleted },
      { eventType: 'expense.paid', handler: this.handleExpensePaid },
      { eventType: 'purchase.received', handler: this.handlePurchaseReceived },
      { eventType: 'invoice.paid', handler: this.handleInvoicePaid },
    ];
  }

  private async handleSaleCreated(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[report-service] Recording sale: ${payload.data.sale_id}`);
    // Aggregate into daily/monthly sales reports
  }

  private async handleSaleCompleted(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[report-service] Sale completed: ${payload.data.sale_id}`);
  }

  private async handlePaymentCompleted(payload: EventPayload<PaymentCreatedPayload>): Promise<void> {
    console.log(`[report-service] Payment recorded: ${payload.data.payment_id}`);
    // Aggregate into cash flow reports
  }

  private async handleExpensePaid(payload: EventPayload<{ expense_id: string; amount: number }>): Promise<void> {
    console.log(`[report-service] Expense recorded: ${payload.data.expense_id}`);
    // Aggregate into expense reports
  }

  private async handlePurchaseReceived(payload: EventPayload<{ purchase_id: string }>): Promise<void> {
    console.log(`[report-service] Purchase received: ${payload.data.purchase_id}`);
    // Aggregate into purchase reports
  }

  private async handleInvoicePaid(payload: EventPayload<{ invoice_id: string }>): Promise<void> {
    console.log(`[report-service] Invoice paid: ${payload.data.invoice_id}`);
    // Aggregate into AR reports
  }
}

export const reportEventService = new ReportEventService();
