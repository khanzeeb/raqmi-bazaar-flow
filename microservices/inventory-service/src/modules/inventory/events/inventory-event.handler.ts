import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryRepository } from '../inventory.repository';
import { ReservationService } from '../reservation.service';
import { MovementType } from '../dto';

/** Listens to Kafka domain events and reacts accordingly (SRP). */
@Injectable()
export class InventoryEventHandler {
  constructor(
    private readonly repo: InventoryRepository,
    private readonly reservations: ReservationService,
  ) {}

  @EventPattern('product.created')
  async onProductCreated(@Payload() payload: any) {
    console.log(`[inventory] product.created: ${payload?.product_id}`);
    // Could auto-create an inventory row for the new product
  }

  @EventPattern('purchase.received')
  async onPurchaseReceived(@Payload() payload: any) {
    console.log(`[inventory] purchase.received: ${payload?.purchase_id}`);
    for (const item of payload?.received_items ?? []) {
      await this.repo.createMovement({
        product_id: item.product_id,
        type: MovementType.IN,
        quantity: item.quantity,
        reason: 'Purchase received',
        reference: `purchase:${payload.purchase_id}`,
      });
    }
  }

  @EventPattern('sale.created')
  async onSaleCreated(@Payload() payload: any) {
    console.log(`[inventory] sale.created: ${payload?.sale_id}`);
    if (payload?.reservation_id) {
      this.reservations.consume(payload.reservation_id);
    }
  }

  @EventPattern('sale.cancelled')
  async onSaleCancelled(@Payload() payload: any) {
    console.log(`[inventory] sale.cancelled: ${payload?.sale_id}`);
    // Restock logic would go here
  }

  @EventPattern('return.completed')
  async onReturnCompleted(@Payload() payload: any) {
    console.log(`[inventory] return.completed: ${payload?.return_id}`);
  }
}
