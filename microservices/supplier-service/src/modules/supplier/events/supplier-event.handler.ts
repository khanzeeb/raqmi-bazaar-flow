import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SupplierRepository } from '../supplier.repository';

/** Listens to Kafka domain events and reacts accordingly (SRP). */
@Injectable()
export class SupplierEventHandler {
  constructor(private readonly repo: SupplierRepository) {}

  @EventPattern('purchase.created')
  async onPurchaseCreated(@Payload() payload: any) {
    console.log(`[supplier] purchase.created for supplier: ${payload?.supplier_id}`);
    // Could update supplier last_order_date or order_count
  }

  @EventPattern('purchase.received')
  async onPurchaseReceived(@Payload() payload: any) {
    console.log(`[supplier] purchase.received: ${payload?.purchase_id}`);
    // Could trigger supplier rating prompt
  }

  @EventPattern('payment.made')
  async onPaymentMade(@Payload() payload: any) {
    console.log(`[supplier] payment.made: ${payload?.payment_id}`);
    // Could update supplier payment history / credit usage
  }

  @EventPattern('product.supplier_changed')
  async onProductSupplierChanged(@Payload() payload: any) {
    console.log(`[supplier] product.supplier_changed: ${payload?.product_id}`);
    // Could update supplier product count
  }
}
