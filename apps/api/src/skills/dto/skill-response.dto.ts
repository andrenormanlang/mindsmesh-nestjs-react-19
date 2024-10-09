// src/skills/dto/skill-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { SkillLevel } from '../enums/skill-level.enum';

export class SkillResponseDto {
  @ApiProperty({
    example: 'uuid-5678',
    description: 'The unique identifier for the skill',
  })
  id: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of the skill',
  })
  title: string;

  @ApiProperty({
    example: 'Advanced',
    description: 'The proficiency level of the skill',
    enum: SkillLevel,
  })
  level: SkillLevel;

  @ApiProperty({
    example: 'Proficient in building scalable web applications.',
    description: 'A brief description of the skill',
  })
  description: string;

  @ApiProperty({
    example: 100,
    description: 'The price associated with the skill',
  })
  price: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if the skill is currently available',
  })
  isAvailable: boolean;
}
