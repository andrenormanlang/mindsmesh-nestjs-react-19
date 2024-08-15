import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { Request as ExpressRequest } from 'express'; // Import the Request type
import { JwtAuthGuard } from './jwt.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.sendPasswordReset(email);
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been reset' };
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('profile')
  // getProfile(@Request() req: ExpressRequest) {
  //   // Explicitly type the req parameter
  //   return req.user;
  // }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest) {
    // Explicitly type the req parameter
    return req.user;
  }
}
