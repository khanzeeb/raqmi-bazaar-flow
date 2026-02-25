import { Module } from '@nestjs/common';
import { KnexModule } from './database/knex.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [KnexModule, ExpenseModule],
  controllers: [HealthController],
})
export class AppModule {}
