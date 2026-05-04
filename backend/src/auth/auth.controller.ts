import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(): string {
    return this.authService.login();
  }

  @Get('/user')
  getUser(): string {
    return this.authService.getUser();
  }
}
