import { Body, Controller, Post, UseGuards, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginAuthDto } from 'src/auth/dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('login')
    @HttpCode(HttpStatus.OK)
    loginUser(@Body(new ValidationPipe()) userObjectLogin: LoginAuthDto){    
      return this.authService.login(userObjectLogin);
    }
}
