import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtAuthService: JwtService,
  ) { }

  async login(userObjectLogin: LoginAuthDto) {
    const { user, password } = userObjectLogin;
    const findUser = await this.usersService.findOneByUserForAuth(user);

    if (!findUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: findUser.id, name: findUser.name };
    const token = this.jwtAuthService.sign(payload);
    const safeUser = this.usersService.sanitizeUser(findUser);

    return { user: safeUser, token };
  }
}
