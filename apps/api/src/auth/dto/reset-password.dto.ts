// src/auth/dto/reset-password.dto.ts

import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The password reset token received via email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'The new password for the user account',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}
