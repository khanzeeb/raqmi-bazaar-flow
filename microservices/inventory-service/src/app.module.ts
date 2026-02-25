import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, InventoryModule],
  controllers: [HealthController],
})
export class AppModule {}
