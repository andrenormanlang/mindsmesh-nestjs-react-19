// src/users/dto/user-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { SkillDto } from './skill-service.dto';

export class UserResponseDto {
  @ApiProperty({
    example: 'uuid-1234',
    description: 'The unique identifier for the user',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'The username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
    enum: ['admin', 'user', 'guest'],
  })
  role: string;

  @ApiProperty({
    example: ['https://example.com/image1.png'],
    description: 'Array of image URLs associated with the user',
    required: false,
    type: [String],
  })
  imageUrls?: string[];

  @ApiProperty({
    example: true,
    description: 'Indicates whether the user has verified their email address',
  })
  isEmailVerified: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the user has administrative privileges',
  })
  isAdmin: boolean;

  @ApiProperty({
    type: () => SkillDto,
    description: 'Skills associated with the user',
    isArray: true,
  })
  skills: SkillDto[];
}
