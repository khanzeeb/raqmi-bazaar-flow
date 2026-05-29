import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentRepository } from './payment.repository';
import { PaymentService, KAFKA_CLIENT } from './payment.service';
import { PaymentMapper } from './payment.mapper';
import { PaymentController } from './payment.controller';
import { PaymentEventHandler } from './events/payment-event.handler';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    PaymentMapper,
    PaymentService,
    PaymentEventHandler,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
