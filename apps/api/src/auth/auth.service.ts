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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const foundUser = await this.usersService.findByEmail(user.email);
    console.log("Stored hashed password:", foundUser.password);
console.log("Password comparison result:", await bcrypt.compare(user.password, foundUser.password));
    if (
      !foundUser ||
      !(await bcrypt.compare(user.password, foundUser.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
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
    const newUser = await this.usersService.create({
      ...user,
      password: hashedPassword,
    });
    return this.login(newUser);
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
      // Decode the token to get the payload
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
      });
  
      console.log('Received reset token payload:', payload);
  
      // Find the user by email from token payload
      const user = await this.usersService.findByEmail(payload.email);
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      // Log the current hashed password
      console.log('Current hashed password for user:', user.password);
  
      // Update the user with the new password directly (assuming update will handle hashing)
      await this.usersService.update(user.id, { password: newPassword }); // Pass the plain new password
  
      // Fetch the user again to verify the update
      const updatedUser = await this.usersService.findByEmail(payload.email);
      console.log('Stored hashed password after update:', updatedUser.password);
  
      // Verify if the password was updated correctly
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.password);
      if (!passwordMatches) {
        console.error('Password mismatch detected after update');
        throw new InternalServerErrorException('Password update verification failed');
      }
  
      console.log('Password updated successfully for user:', updatedUser.email);
  
    } catch (error) {
      console.error('Error during password reset:', error.message);
      throw new BadRequestException('Invalid or expired token');
    }
  }
  
  
  
  
  
}
