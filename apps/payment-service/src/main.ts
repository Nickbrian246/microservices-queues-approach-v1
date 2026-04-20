import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PaymentServiceModule } from './payment-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES } from '@app/providers';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: QUEUE_NAMES.PAYMENT,
        queueOptions: { durable: true },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen();
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
