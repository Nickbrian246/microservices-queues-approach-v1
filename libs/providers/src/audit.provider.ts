import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from './constants/microservice-names';
import { QUEUE_NAMES } from './constants/queue-names';

export const AuditClientProvider: Provider = {
  provide: MICROSERVICE_NAMES.AUDIT,
  useFactory: (configService: ConfigService): ClientProxy => {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
        queue: QUEUE_NAMES.AUDIT,
        queueOptions: { durable: true },
      },
    });
  },
  inject: [ConfigService],
};
