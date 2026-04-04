import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '@app/dtos';
import { SignInDto } from '@app/dtos';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }

  async signIn(dto: SignInDto): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: dto.email, password: dto.password },
    });
  }
}
