import { Module } from '@nestjs/common';
import { PricingRepository } from './pricing.repository';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PricingEventHandler } from './events/pricing-event.handler';

@Module({
  controllers: [PricingController],
  providers: [PricingRepository, PricingService, PricingEventHandler],
  exports: [PricingService],
})
export class PricingModule {}
