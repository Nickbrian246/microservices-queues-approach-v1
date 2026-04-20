import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PAYMENT_PATTERNS } from '@app/patterns';
import { CreatePaymentDto, UpdatePaymentDto } from '@app/dtos';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE)
  create(@Payload() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_ALL)
  findAll() {
    return this.paymentsService.findAll();
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.paymentsService.findOne(id);
  }

  @MessagePattern(PAYMENT_PATTERNS.UPDATE)
  update(@Payload() dto: UpdatePaymentDto) {
    return this.paymentsService.update(dto);
  }

  @MessagePattern(PAYMENT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.paymentsService.delete(id);
  }
}
