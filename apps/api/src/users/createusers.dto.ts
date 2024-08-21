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
import { Skill } from './skill.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsString()
  username!: string;

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean = false;

  @ValidateNested({ each: true })
  @Type(() => Skill)
  skills: Skill[];
}

export class CreateUsersDto {
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}
