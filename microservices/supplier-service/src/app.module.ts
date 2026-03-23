import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, SupplierModule],
  controllers: [HealthController],
})
export class AppModule {}
