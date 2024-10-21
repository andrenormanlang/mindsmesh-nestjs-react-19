import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Skill } from '../../skills/entities/skill.entity'; 
export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => Skill) // Transform plain object to Skill class instance
  @IsOptional()
  skills?: Skill[]; // Add the skills property to your DTO
}
