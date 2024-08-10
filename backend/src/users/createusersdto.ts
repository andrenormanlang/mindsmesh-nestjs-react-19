import { IsBoolean, IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Skill } from './skill.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  username!: string;

  @IsBoolean()
  isAdmin: boolean;

  @ValidateNested({ each: true })
  @Type(() => Skill)
  skills: Skill[];
}

export class CreateUsersDto {
    @ValidateNested({ each: true })
    @Type(() => CreateUserDto)
    users: CreateUserDto[];
  }