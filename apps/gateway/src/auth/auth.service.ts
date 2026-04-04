import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS } from '@app/patterns';
import { MICROSERVICE_NAMES } from '@app/providers';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(MICROSERVICE_NAMES.USERS)
    private readonly usersClient: ClientProxy,
  ) {}

  register(dto: RegisterDto) {
    return this.usersClient.send(AUTH_PATTERNS.REGISTER, dto);
  }

  signIn(dto: SignInDto) {
    return this.usersClient.send(AUTH_PATTERNS.SIGN_IN, dto);
  }
}
