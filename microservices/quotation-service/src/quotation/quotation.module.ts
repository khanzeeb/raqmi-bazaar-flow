import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { QuotationHistory } from './entities/quotation-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation, QuotationItem, QuotationHistory]),
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'quotation-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'quotation-notification-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [QuotationController],
  providers: [QuotationService],
  exports: [QuotationService],
})
export class QuotationModule {}
