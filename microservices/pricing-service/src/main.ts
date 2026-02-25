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
        client: { brokers: [kafkaBroker], clientId: 'pricing-service' },
        consumer: { groupId: 'pricing-service-group' },
      },
    });
    await app.startAllMicroservices();
    console.log('[pricing-service] Kafka connected');
  } catch (err) {
    console.warn('[pricing-service] Running without Kafka:', (err as Error).message);
  }

  const port = process.env.PORT || 3009;
  await app.listen(port);
  console.log(`pricing-service running on port ${port}`);
}

bootstrap();
