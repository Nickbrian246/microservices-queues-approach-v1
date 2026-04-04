import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('USERS'),
  ],
  controllers: [UsersServiceController],
  providers: [UsersServiceService],
})
export class UsersServiceModule {}
