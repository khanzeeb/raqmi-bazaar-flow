import { Module } from '@nestjs/common';
import { SupplierRepository } from './supplier.repository';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { SupplierEventHandler } from './events/supplier-event.handler';

@Module({
  controllers: [SupplierController],
  providers: [
    SupplierRepository,
    SupplierService,
    SupplierEventHandler,
  ],
  exports: [SupplierService],
})
export class SupplierModule {}
