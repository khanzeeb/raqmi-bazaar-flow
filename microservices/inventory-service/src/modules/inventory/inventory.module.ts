import { Module } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';
import { ReservationService } from './reservation.service';
import { InventoryController } from './inventory.controller';
import { ReservationController } from './reservation.controller';
import { InventoryEventHandler } from './events/inventory-event.handler';

@Module({
  controllers: [InventoryController, ReservationController],
  providers: [
    InventoryRepository,
    InventoryService,
    ReservationService,
    InventoryEventHandler,
  ],
  exports: [InventoryService, ReservationService],
})
export class InventoryModule {}
