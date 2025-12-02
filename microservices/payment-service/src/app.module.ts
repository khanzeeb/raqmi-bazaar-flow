import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-to-order',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'payment-to-order-consumer',
          },
        },
      },
      {
        name: 'INVOICE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-to-invoice',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'payment-to-invoice-consumer',
          },
        },
      },
    ]),
    PrismaModule,
    PaymentModule,
  ],
})
export class AppModule {}
