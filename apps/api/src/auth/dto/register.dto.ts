// src/auth/dto/register.dto.ts

import { IsEmail, IsString, MinLength, Matches, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe',
  })
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'List of skills associated with the user',
    example: ['JavaScript', 'NestJS'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  skills?: string[];
}
