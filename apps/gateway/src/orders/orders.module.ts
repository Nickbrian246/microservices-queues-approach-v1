import { Module } from '@nestjs/common';
import { OrderClientProvider } from '@app/providers';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderClientProvider],
})
export class OrdersModule {}
