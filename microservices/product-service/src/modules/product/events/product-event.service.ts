import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: string;
  source: string;
}

@Injectable()
export class ProductEventService {
  private readonly serviceName = 'product-service';

  @EventPattern('purchase.received')
  async handlePurchaseReceived(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing purchase.received: ${payload.data?.purchase_id}`);
    // Update product stock based on received items
  }

  @EventPattern('return.completed')
  async handleReturnCompleted(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing return.completed: ${payload.data?.return_id}`);
    // Restock returned items if applicable
  }

  @EventPattern('sale.created')
  async handleSaleCreated(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing sale.created: ${payload.data?.sale_id}`);
    // Stock should already be reserved/deducted by inventory saga
  }

  @EventPattern('sale.cancelled')
  async handleSaleCancelled(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing sale.cancelled: ${payload.data?.sale_id}`);
    // Restore stock for cancelled sale items
  }

  @EventPattern('inventory.adjusted')
  async handleInventoryAdjusted(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing inventory.adjusted: ${payload.data?.product_id}`);
    // Sync product stock with inventory adjustment
  }
}
