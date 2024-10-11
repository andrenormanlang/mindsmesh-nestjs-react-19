import {
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user-service.dto';

  export class CreateUsersDto {
    @ValidateNested({ each: true })
    @Type(() => CreateUserDto)
    users: CreateUserDto[];
  }
  