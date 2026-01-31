import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../entities/customer.entity';
import { CustomerCreditHistory } from '../../entities/customer-credit-history.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEventService } from './events/customer-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerCreditHistory])],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerEventService],
  exports: [CustomerService],
})
export class CustomerModule {}
