import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_PATTERNS } from '@app/patterns';
import { MICROSERVICE_NAMES } from '@app/providers';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(MICROSERVICE_NAMES.PAYMENT)
    private readonly paymentClient: ClientProxy,
  ) {}

  create(dto: CreatePaymentDto) {
    return this.paymentClient.send(PAYMENT_PATTERNS.CREATE, dto);
  }

  findAll() {
    return this.paymentClient.send(PAYMENT_PATTERNS.FIND_ALL, {});
  }

  findOne(id: number) {
    return this.paymentClient.send(PAYMENT_PATTERNS.FIND_ONE, id);
  }

  update(id: number, dto: UpdatePaymentDto) {
    return this.paymentClient.send(PAYMENT_PATTERNS.UPDATE, { id, ...dto });
  }

  delete(id: number) {
    return this.paymentClient.send(PAYMENT_PATTERNS.DELETE, id);
  }
}
