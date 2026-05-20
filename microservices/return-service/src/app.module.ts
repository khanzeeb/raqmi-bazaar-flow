import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { ReturnModule } from './modules/return/return.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, ReturnModule],
  controllers: [HealthController],
})
export class AppModule {}
