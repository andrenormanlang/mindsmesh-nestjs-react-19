import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SkillDto } from './skill-service.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'The password for the user account',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.png'],
    description: 'Optional array of image URLs associated with the user',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'imageUrls must be an array of strings' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  imageUrls?: string[];

  @ApiProperty({
    example: 'JohnDoe',
    description: 'The username of the user',
  })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indicates whether the user has administrative privileges',
  })
  @IsBoolean({ message: 'isAdmin must be a boolean' })
  @IsOptional()
  isAdmin: boolean = false;

  @ApiProperty({
    type: () => SkillDto,
    description: 'Skills associated with the user',
    isArray: true,
  })
  @IsArray({ message: 'Skills must be an array of SkillDto objects' })
  @ValidateNested({
    each: true,
    message: 'Each skill must be a valid SkillDto',
  })
  @Type(() => SkillDto)
  skills: SkillDto[];
}
