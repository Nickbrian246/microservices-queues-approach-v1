import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { AuditServiceController } from './audit-service.controller';
import { AuditServiceService } from './audit-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('AUDIT'),
  ],
  controllers: [AuditServiceController],
  providers: [AuditServiceService],
})
export class AuditServiceModule {}
