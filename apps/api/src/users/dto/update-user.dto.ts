import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Skill } from '../../skills/entities/skill.entity';
import { UserRole } from '../enums/user-role.enum';


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

  @IsEnum(UserRole, { message: 'Role must be either freelancer or employer' })
  @IsOptional()
  role?: UserRole;

  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean; // Add the isOnline property to the DTO

  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => Skill) // Transform plain object to Skill class instance
  @IsOptional()
  skills?: Skill[]; // Add the skills property to your DTO
}
