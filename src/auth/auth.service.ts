import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginAuthDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtAuthService: JwtService,
  ) {}

  async login(userObjectLogin: LoginAuthDto) {
    const { user, password } = userObjectLogin;
    const findUser = await this.userRepository.findOne({ where: { user }, relations: ['company'] });
    if (!findUser) throw new HttpException('USER_NOT_FOUND', 404);
    const isValid = await bcrypt.compare(password, findUser.password);
    if (!isValid) throw new HttpException('PASSWORD_INVALID', 403);
    const payload = { id: findUser.id, name: findUser.name };
    const token = this.jwtAuthService.sign(payload);
    const { password: _omit, ...safeUser } = findUser as any;
    const data = { user: safeUser, token };
    return data;
  }
}
