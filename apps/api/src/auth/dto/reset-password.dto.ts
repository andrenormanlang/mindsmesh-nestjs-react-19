import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password for the user account',
    example: 'NewP@ssw0rd!',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]{8,}$/, {
    message: 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character',
  })
  newPassword: string;
}

