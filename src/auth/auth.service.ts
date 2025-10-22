import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth.dto';
import { IAuthRepository, AUTH_REPOSITORY_TOKEN } from './interfaces/auth-manager.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly jwtAuthService: JwtService,
  ) {}

  async login(userObjectLogin: LoginAuthDto): Promise<AuthResponseDto> {
    const { user, password } = userObjectLogin;

    try {
      const findUser = await this.authRepository.findUserByUsername(user);

      if (!findUser) {
        this.logger.warn(`Login attempt with non-existent user: ${user}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verificar contraseña hasheada
      const isPasswordValid = await bcrypt.compare(password, findUser.password);
      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for user: ${user}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Successful login for user: ${user}`);

      const payload = { id: findUser.id, name: findUser.name };
      const token = this.jwtAuthService.sign(payload);

      const response: AuthResponseDto = {
        token,
        user: {
          id: findUser.id.toString(),
          name: findUser.name,
          user: findUser.user,
          permissions: findUser.permissions,
          // Incluir información de la compañía si el usuario tiene una asignada
          company: findUser.company ? {
            id: findUser.company.id.toString(),
            name: findUser.company.name,
            nit: findUser.company.nit,
            phone: findUser.company.phone,
            address: findUser.company.address,
            contractual: findUser.company.contractual,
            extraContractual: findUser.company.extraContractual,
            contractualExpires: findUser.company.contractualExpires,
            extraContractualExpires: findUser.company.extraContractualExpires,
          } : undefined
        },
      };

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Login error for user ${user}: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
