import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ReturnRepository } from '../return.repository';

/** Listens to Kafka domain events related to returns (SRP). */
@Injectable()
export class ReturnEventHandler {
  constructor(private readonly repo: ReturnRepository) {}

  @EventPattern('sale.cancelled')
  async onSaleCancelled(@Payload() payload: any) {
    console.log(`[return] sale.cancelled: ${payload?.sale_id}`);
    // Could auto-create / cancel pending returns associated with the sale.
  }

  @EventPattern('payment.refunded')
  async onPaymentRefunded(@Payload() payload: any) {
    console.log(`[return] payment.refunded: ${payload?.payment_id}`);
    // Could mark associated return refund_status = processed.
  }

  @EventPattern('inventory.restock_failed')
  async onRestockFailed(@Payload() payload: any) {
    console.log(`[return] inventory.restock_failed: ${payload?.return_id}`);
    // Could flag the return for manual reconciliation.
  }
}
