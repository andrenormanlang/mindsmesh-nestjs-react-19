// src/users/updateskill.dto.ts
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateSkillDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  isAvailable: boolean;
}
