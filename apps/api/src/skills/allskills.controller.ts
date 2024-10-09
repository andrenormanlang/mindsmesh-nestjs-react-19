import { Controller, Get, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { plainToClass } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Skills')
@Controller('skills')
export class AllSkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('all')
  @ApiOperation({ summary: 'Retrieve all skill titles' })
  @ApiResponse({
    status: 200,
    description: 'List of all skill titles',
    schema: {
      type: 'array',
      items: { type: 'string', example: 'JavaScript' },
    },
  })
  async getAllSkills(): Promise<{ title: string }[]> {
    return this.skillsService.getAllSkills();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by skill' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Query string to search skills',
    type: String,
    example: 'JavaScript',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users matching the skill query',
    type: [UserResponseDto],
  })
  async searchUsersBySkill(@Query('q') query: string): Promise<UserResponseDto[]> {
    const users = await this.skillsService.searchUsersBySkill(query);
    return users
  }
}
