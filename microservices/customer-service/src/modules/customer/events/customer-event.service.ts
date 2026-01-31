import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: string;
  source: string;
}

@Injectable()
export class CustomerEventService {
  private readonly serviceName = 'customer-service';

  // ============= Event Handlers =============

  @EventPattern('sale.created')
  async handleSaleCreated(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing sale.created for customer ${payload.data?.customer_id}`);
    // Update customer's order count and total spent
  }

  @EventPattern('sale.completed')
  async handleSaleCompleted(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing sale.completed for customer ${payload.data?.customer_id}`);
    // Update customer's completed orders count
  }

  @EventPattern('sale.cancelled')
  async handleSaleCancelled(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing sale.cancelled for sale ${payload.data?.sale_id}`);
    // Update customer's cancelled orders count
  }

  @EventPattern('payment.completed')
  async handlePaymentCompleted(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing payment.completed for customer ${payload.data?.customer_id}`);
    // Reduce customer's outstanding balance
  }

  @EventPattern('payment.refunded')
  async handlePaymentRefunded(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing payment.refunded for ${payload.data?.payment_id}`);
    // Increase customer's outstanding balance
  }

  @EventPattern('invoice.overdue')
  async handleInvoiceOverdue(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing invoice.overdue for customer ${payload.data?.customer_id}`);
    // Update customer's overdue amount and potentially block if exceeds threshold
  }
}
