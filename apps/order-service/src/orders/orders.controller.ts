import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ORDER_PATTERNS } from '@app/patterns';
import { CreateOrderDto, UpdateOrderDto } from '@app/dtos';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @EventPattern(ORDER_PATTERNS.CREATE)
  async create(@Payload() dto: CreateOrderDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    await this.ordersService.create(dto);

    // ack tells RabbitMQ "processed successfully, remove from queue"
    // if this line is never reached (crash), RabbitMQ requeues the message
    channel.ack(originalMessage);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ALL)
  findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern(ORDER_PATTERNS.UPDATE)
  update(@Payload() dto: UpdateOrderDto) {
    return this.ordersService.update(dto);
  }

  @MessagePattern(ORDER_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.ordersService.delete(id);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_STUCK)
  findStuck() {
    return this.ordersService.findStuck();
  }
}
