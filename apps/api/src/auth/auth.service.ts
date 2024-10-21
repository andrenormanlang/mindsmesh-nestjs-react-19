import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { SendGridService } from '../sendgrid/sendgrid.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendGridService: SendGridService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email before logging in.');
      }
      // User verified, continue login
      return user;
    } else {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }

  async login(user: any) {
    const foundUser = await this.usersService.findByEmail(user.email);
  
    if (!foundUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const passwordMatches = await bcrypt.compare(user.password, foundUser.password);
    console.log('Password comparison result:', passwordMatches);
    console.log('User isEmailVerified:', foundUser.isEmailVerified);
  
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    if (!foundUser.isEmailVerified) {
      throw new UnauthorizedException('Email not verified. Please check your email to verify your account.');
    }
  
    const payload = {
      email: foundUser.email,
      sub: foundUser.id,
      role: foundUser.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  
  
  async register(user: any) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await this.usersService.create({
      ...user,
      password: hashedPassword,
    });
    return { message: 'Registration successful. Please verify your email.' };
  }

  async sendPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      {
        secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
        expiresIn: this.configService.get<string>('RESET_PASSWORD_EXPIRES_IN'),
      }
    );

    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.sendGridService.sendPasswordResetEmail(user.email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
      });
  
      const user = await this.usersService.findByEmail(payload.email);
  
      if (!user) {
        throw new NotFoundException('User not found');
      }

      
  
      await this.usersService.update(user.id, { password: newPassword }); 
  
      const updatedUser = await this.usersService.findByEmail(payload.email);
  
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.password);
      if (!passwordMatches) {
        throw new InternalServerErrorException('Password update verification failed');
      }
  
    } catch (error) {
      console.error('Error during password reset:', error.message);
      throw new BadRequestException('Invalid or expired token');
    }
  }  
}
