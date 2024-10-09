// src/auth/dto/login.dto.ts

import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user attempting to log in',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'The password corresponding to the user account',
  })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
