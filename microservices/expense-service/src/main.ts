import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: { brokers: [kafkaBroker], clientId: 'expense-service' },
        consumer: { groupId: 'expense-service-group' },
      },
    });
    await app.startAllMicroservices();
    console.log('[expense-service] Kafka connected');
  } catch (err) {
    console.warn('[expense-service] Running without Kafka:', (err as Error).message);
  }

  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`expense-service running on port ${port}`);
}

bootstrap();
