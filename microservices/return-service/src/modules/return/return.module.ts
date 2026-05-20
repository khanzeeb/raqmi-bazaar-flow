import { Module } from '@nestjs/common';
import { ReturnRepository } from './return.repository';
import { ReturnService } from './return.service';
import { ReturnController } from './return.controller';
import { ReturnEventHandler } from './events/return-event.handler';

@Module({
  controllers: [ReturnController],
  providers: [
    ReturnRepository,
    ReturnService,
    ReturnEventHandler,
  ],
  exports: [ReturnService],
})
export class ReturnModule {}
