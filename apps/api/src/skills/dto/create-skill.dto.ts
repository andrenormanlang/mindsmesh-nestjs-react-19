import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';


export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  isAvailable: boolean;
}
