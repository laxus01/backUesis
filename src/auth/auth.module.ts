import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt.constants';
import { JwtStrategy } from './jwt.stategy';
import { AuthRepository } from './repositories/auth.repository';
import { AUTH_REPOSITORY_TOKEN } from './interfaces/auth-manager.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'laundry-app',
        audience: 'laundry-users'
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: AuthRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
