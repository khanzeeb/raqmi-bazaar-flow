import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, PurchaseModule],
  controllers: [HealthController],
})
export class AppModule {}
