import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersScheduler } from './orders.scheduler';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), ScheduleModule.forRoot()],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersScheduler],
})
export class OrdersModule {}
