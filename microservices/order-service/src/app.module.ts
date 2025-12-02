import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVOICE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-to-invoice',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'order-to-invoice-consumer',
          },
        },
      },
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-to-inventory',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'order-to-inventory-consumer',
          },
        },
      },
    ]),
    PrismaModule,
    OrderModule,
  ],
})
export class AppModule {}
