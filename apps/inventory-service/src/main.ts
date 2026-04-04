import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.MICROSERVICE_HOST ?? 'localhost',
        port: parseInt(process.env.INVENTORY_SERVICE_PORT ?? '3002'),
      },
    },
  );
  await app.listen();
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
