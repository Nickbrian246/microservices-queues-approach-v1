import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_PATTERNS } from '@app/patterns';
import { RegisterDto } from '@app/dtos';
import { SignInDto } from '@app/dtos';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.SIGN_IN)
  signIn(@Payload() dto: SignInDto) {
    return this.authService.signIn(dto);
  }
}
