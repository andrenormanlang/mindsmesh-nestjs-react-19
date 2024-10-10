import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { SkillLevel } from '../../skills/enums/skill-level.enum';

export class SkillDto {
  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of the skill',
  })
  @IsString({ message: 'Skill title must be a string' })
  @IsNotEmpty({ message: 'Skill title cannot be empty' })
  title: string;

  // TODO: Add a level property to the SkillDto
  // @ApiProperty({
  //   example: 'Advanced',
  //   description: 'The proficiency level of the skill',
  //   enum: SkillLevel,
  // })
  // @IsString({ message: 'Skill level must be a string' })
  // @IsEnum(SkillLevel, {
  //   message: 'Skill level must be one of Beginner, Intermediate, or Advanced',
  // })
  // level: SkillLevel;

  @ApiProperty({
    example: 'Proficient in building scalable web applications.',
    description: 'A brief description of the skill',
  })
  @IsString({ message: 'Skill description must be a string' })
  description: string;

  @ApiProperty({
    example: 100,
    description: 'The price associated with the skill',
  })
  @IsNumber({}, { message: 'Skill price must be a number' })
  price: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if the skill is currently available',
  })
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable: boolean;
}
