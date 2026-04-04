import { NestFactory } from '@nestjs/core';
import { ShippingServiceModule } from './shipping-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ShippingServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.MICROSERVICE_HOST ?? 'localhost',
        port: parseInt(process.env.SHIPPING_SERVICE_PORT ?? '3007'),
      },
    },
  );
  await app.listen();
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
