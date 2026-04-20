import { Module } from '@nestjs/common';
import { PaymentClientProvider } from '@app/providers';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentClientProvider],
})
export class PaymentsModule {}
