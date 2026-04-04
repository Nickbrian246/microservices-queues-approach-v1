import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { ShippingServiceController } from './shipping-service.controller';
import { ShippingServiceService } from './shipping-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('SHIPPING'),
  ],
  controllers: [ShippingServiceController],
  providers: [ShippingServiceService],
})
export class ShippingServiceModule {}
