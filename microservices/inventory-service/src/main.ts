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

  // Kafka microservice transport
  const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: { brokers: [kafkaBroker], clientId: 'inventory-service' },
        consumer: { groupId: 'inventory-service-group' },
      },
    });
    await app.startAllMicroservices();
    console.log('[inventory-service] Kafka connected');
  } catch (err) {
    console.warn('[inventory-service] Running without Kafka:', (err as Error).message);
  }

  const port = process.env.PORT || 3011;
  await app.listen(port);
  console.log(`inventory-service running on port ${port}`);
}

bootstrap();
