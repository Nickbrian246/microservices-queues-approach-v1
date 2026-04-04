import { NestFactory } from '@nestjs/core';
import { AuditServiceModule } from './audit-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuditServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.MICROSERVICE_HOST ?? 'localhost',
        port: parseInt(process.env.AUDIT_SERVICE_PORT ?? '3001'),
      },
    },
  );
  await app.listen();
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
