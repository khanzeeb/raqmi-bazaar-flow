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
        client: { brokers: [kafkaBroker], clientId: 'purchase-service' },
        consumer: { groupId: 'purchase-service-group' },
      },
    });
    await app.startAllMicroservices();
    console.log('[purchase-service] Kafka connected');
  } catch (err) {
    console.warn('[purchase-service] Running without Kafka:', (err as Error).message);
  }

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`purchase-service running on port ${port}`);
}

bootstrap();
