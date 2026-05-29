import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { PaymentModule } from './modules/payment/payment.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, PaymentModule],
  controllers: [HealthController],
})
export class AppModule {}
