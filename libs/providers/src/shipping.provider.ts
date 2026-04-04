import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from './constants/microservice-names';

export const ShippingClientProvider: Provider = {
  provide: MICROSERVICE_NAMES.SHIPPING,
  useFactory: (configService: ConfigService): ClientProxy => {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.getOrThrow<string>('MICROSERVICE_HOST'),
        port: +configService.getOrThrow<string>('SHIPPING_SERVICE_PORT'),
      },
    });
  },
  inject: [ConfigService],
};
