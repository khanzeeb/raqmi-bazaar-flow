import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PurchaseRepository } from '../purchase.repository';

/** Listens to Kafka domain events and reacts accordingly (SRP). */
@Injectable()
export class PurchaseEventHandler {
  constructor(private readonly repo: PurchaseRepository) {}

  @EventPattern('supplier.updated')
  async onSupplierUpdated(@Payload() payload: any) {
    console.log(`[purchase] supplier.updated: ${payload?.supplier_id}`);
  }

  @EventPattern('product.price_changed')
  async onProductPriceChanged(@Payload() payload: any) {
    console.log(`[purchase] product.price_changed: ${payload?.product_id}`);
  }

  @EventPattern('payment.received')
  async onPaymentReceived(@Payload() payload: any) {
    console.log(`[purchase] payment.received: ${payload?.purchase_id}`);
  }
}
