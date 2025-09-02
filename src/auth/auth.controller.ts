import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoginAuthDto } from 'src/auth/dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('login')
    loginUser(@Body() userObjectLogin: LoginAuthDto){    
      return this.authService.login(userObjectLogin);
    }
}
