import {
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserControllerDto } from './create-user-controller.dto';

export class CreateUsersDto {
  @ValidateNested({ each: true })
  @Type(() => CreateUserControllerDto)
  users: CreateUserControllerDto[];
}
