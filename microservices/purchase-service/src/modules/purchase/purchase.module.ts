import { Module } from '@nestjs/common';
import { PurchaseRepository } from './purchase.repository';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseEventHandler } from './events/purchase-event.handler';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseRepository, PurchaseService, PurchaseEventHandler],
  exports: [PurchaseService],
})
export class PurchaseModule {}
