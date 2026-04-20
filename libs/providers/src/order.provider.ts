import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from './constants/microservice-names';
import { QUEUE_NAMES } from './constants/queue-names';

export const OrderClientProvider: Provider = {
  provide: MICROSERVICE_NAMES.ORDER,
  useFactory: (configService: ConfigService): ClientProxy => {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
        queue: QUEUE_NAMES.ORDER,
        queueOptions: { durable: true },
      },
    });
  },
  inject: [ConfigService],
};
