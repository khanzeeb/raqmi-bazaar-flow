import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Injectable()
export class PricingEventHandler {
  @EventPattern('product.created')
  async onProductCreated(@Payload() payload: any) {
    console.log(`[pricing] product.created: ${payload?.product_id}`);
  }

  @EventPattern('product.updated')
  async onProductUpdated(@Payload() payload: any) {
    console.log(`[pricing] product.updated: ${payload?.product_id}`);
  }

  @EventPattern('product.stock.updated')
  async onStockUpdated(@Payload() payload: any) {
    console.log(`[pricing] stock updated: ${payload?.product_id}`);
  }

  @EventPattern('product.low_stock')
  async onLowStock(@Payload() payload: any) {
    console.log(`[pricing] low stock: ${payload?.product_id}`);
  }
}
