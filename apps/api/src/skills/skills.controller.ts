// src/skills/skills.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillResponseDto } from './dto/skill-response.dto';
import { plainToClass } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Skills')
@Controller('users/:userId/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new skill for a user' })
  @ApiBody({ type: CreateSkillDto })
  @ApiResponse({
    status: 201,
    description: 'Skill successfully created',
    type: SkillResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Param('userId') userId: string,
    @Body() createSkillDto: CreateSkillDto
  ): Promise<SkillResponseDto> {
    const skill = await this.skillsService.create(userId, createSkillDto);
    return plainToClass(SkillResponseDto, skill);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all skills for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of skills',
    type: [SkillResponseDto],
  })
  async findAll(@Param('userId') userId: string): Promise<SkillResponseDto[]> {
    const skills = await this.skillsService.findAll(userId);
    return skills.map(skill => plainToClass(SkillResponseDto, skill));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific skill by ID for a user' })
  @ApiResponse({
    status: 200,
    description: 'Skill retrieved successfully',
    type: SkillResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async findOne(
    @Param('userId') userId: string,
    @Param('id') id: string
  ): Promise<SkillResponseDto> {
    const skill = await this.skillsService.findOne(userId, id);
    return plainToClass(SkillResponseDto, skill);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a skill by ID for a user' })
  @ApiBody({ type: UpdateSkillDto })
  @ApiResponse({
    status: 200,
    description: 'Skill successfully updated',
    type: SkillResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto
  ): Promise<SkillResponseDto> {
    const updatedSkill = await this.skillsService.update(userId, id, updateSkillDto);
    return plainToClass(SkillResponseDto, updatedSkill);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a skill by ID for a user' })
  @ApiResponse({
    status: 200,
    description: 'Skill successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async remove(
    @Param('userId') userId: string,
    @Param('id') id: string
  ): Promise<{ message: string }> {
    await this.skillsService.remove(userId, id);
    return { message: 'Skill successfully deleted' };
  }
}
