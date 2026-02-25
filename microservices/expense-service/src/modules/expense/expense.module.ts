import { Module } from '@nestjs/common';
import { ExpenseRepository } from './expense.repository';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ExpenseEventHandler } from './events/expense-event.handler';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseRepository, ExpenseService, ExpenseEventHandler],
  exports: [ExpenseService],
})
export class ExpenseModule {}
