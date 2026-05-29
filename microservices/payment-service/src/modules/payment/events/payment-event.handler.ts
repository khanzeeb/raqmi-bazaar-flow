import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentRepository } from '../payment.repository';

/** Listens to Kafka domain events related to payments (SRP). */
@Injectable()
export class PaymentEventHandler {
  constructor(private readonly repo: PaymentRepository) {}

  @EventPattern('invoice.cancelled')
  async onInvoiceCancelled(@Payload() payload: any) {
    console.log(`[payment] invoice.cancelled: ${payload?.invoice_id}`);
    // Could release allocations tied to the cancelled invoice.
  }

  @EventPattern('order.cancelled')
  async onOrderCancelled(@Payload() payload: any) {
    console.log(`[payment] order.cancelled: ${payload?.order_id}`);
    // Could release allocations tied to the cancelled order.
  }

  @EventPattern('return.completed')
  async onReturnCompleted(@Payload() payload: any) {
    console.log(`[payment] return.completed: ${payload?.return_id}`);
    // Could trigger a refund flow on the linked payment.
  }
}
