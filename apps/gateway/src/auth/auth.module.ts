import { Module } from '@nestjs/common';
import { UsersClientProvider } from '@app/providers';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersClientProvider],
})
export class AuthModule {}
