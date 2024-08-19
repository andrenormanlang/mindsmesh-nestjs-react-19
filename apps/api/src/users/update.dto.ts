import { IsBoolean, IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Skill } from './skill.entity';  // Adjust the import path based on your project structure

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

  @IsString()
  @IsOptional()
  role?: string;

  @IsString({ each: true })
  @IsOptional()
  avatarUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ValidateNested({ each: true })  // Validate each item in the array
  @Type(() => Skill)  // Transform plain object to Skill class instance
  @IsOptional()
  skills?: Skill[];  // Add the skills property to your DTO
}