import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, PricingModule],
  controllers: [HealthController],
})
export class AppModule {}
