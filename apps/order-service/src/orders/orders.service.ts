import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderDto } from '@app/dtos';
import { Order } from './entities/order.entity';

const STUCK_THRESHOLD_MINUTES = 5;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({ ...dto, status: 'pending' });
    return await this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find();
  }

  async findOne(id: number): Promise<Order | null> {
    return await this.orderRepository.findOne({ where: { id } });
  }

  async update(dto: UpdateOrderDto): Promise<Order | null> {
    const { id, ...data } = dto;
    await this.orderRepository.update(id, data);
    return await this.orderRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async findStuck(): Promise<Order[]> {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - STUCK_THRESHOLD_MINUTES);

    return await this.orderRepository.find({
      where: { status: 'pending', created_at: LessThan(threshold) },
    });
  }

  async retryStuck(): Promise<void> {
    const stuck = await this.findStuck();

    if (stuck.length === 0) return;

    this.logger.warn(`Found ${stuck.length} stuck order(s) — retrying`);

    for (const order of stuck) {
      try {
        await this.orderRepository.update(order.id, { status: 'pending' });
        this.logger.log(`Retried order ${order.id}`);
      } catch (err) {
        this.logger.error(`Failed to retry order ${order.id}`, err);
      }
    }
  }
}
