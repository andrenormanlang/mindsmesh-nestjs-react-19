import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  token: string;
  newPassword: string;
}