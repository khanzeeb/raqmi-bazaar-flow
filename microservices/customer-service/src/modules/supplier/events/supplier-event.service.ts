import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: string;
  source: string;
}

@Injectable()
export class SupplierEventService {
  private readonly serviceName = 'customer-service';

  // ============= Event Handlers =============

  @EventPattern('purchase.created')
  async handlePurchaseCreated(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing purchase.created for supplier ${payload.data?.supplier_id}`);
    // Update supplier's order count and total value
  }

  @EventPattern('purchase.received')
  async handlePurchaseReceived(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing purchase.received for ${payload.data?.purchase_id}`);
    // Update supplier's fulfilled orders count
  }

  @EventPattern('purchase.cancelled')
  async handlePurchaseCancelled(@Payload() payload: EventPayload) {
    console.log(`[${this.serviceName}] Processing purchase.cancelled for ${payload.data?.purchase_id}`);
    // Update supplier's cancelled orders count
  }
}
