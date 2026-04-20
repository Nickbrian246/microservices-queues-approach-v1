import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto, UpdatePaymentDto } from '@app/dtos';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(dto);
    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find();
  }

  async findOne(id: number): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { id } });
  }

  async update(dto: UpdatePaymentDto): Promise<Payment | null> {
    const { id, ...data } = dto;
    await this.paymentRepository.update(id, data);
    return await this.paymentRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.paymentRepository.delete(id);
  }
}
