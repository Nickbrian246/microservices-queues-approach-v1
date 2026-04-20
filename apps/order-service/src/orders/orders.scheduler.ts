import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersScheduler {
  constructor(private readonly ordersService: OrdersService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleStuckOrders() {
    await this.ordersService.retryStuck();
  }
}
