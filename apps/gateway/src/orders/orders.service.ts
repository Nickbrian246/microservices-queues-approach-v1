import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_PATTERNS } from '@app/patterns';
import { MICROSERVICE_NAMES } from '@app/providers';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(MICROSERVICE_NAMES.ORDER)
    private readonly orderClient: ClientProxy,
  ) {}

  create(dto: CreateOrderDto) {
    // emit = fire and forget, RabbitMQ confirms receipt, client gets immediate response
    this.orderClient.emit(ORDER_PATTERNS.CREATE, dto);
    return { message: 'Order received, we are processing it' };
  }

  findAll() {
    return this.orderClient.send(ORDER_PATTERNS.FIND_ALL, {});
  }

  findOne(id: number) {
    return this.orderClient.send(ORDER_PATTERNS.FIND_ONE, id);
  }

  update(id: number, dto: UpdateOrderDto) {
    return this.orderClient.send(ORDER_PATTERNS.UPDATE, { id, ...dto });
  }

  delete(id: number) {
    return this.orderClient.send(ORDER_PATTERNS.DELETE, id);
  }

  findStuck() {
    return this.orderClient.send(ORDER_PATTERNS.FIND_STUCK, {});
  }
}
