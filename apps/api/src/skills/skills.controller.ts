import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './skills.entity';

@Controller('users/:userId/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Param('userId') userId: string, @Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(userId, createSkillDto);
  }

  @Get()
  findAll(@Param('userId') userId: string) {
    return this.skillsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.skillsService.findOne(userId, id);
  }


  @Put(':id')
  update(@Param('userId') userId: string, @Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(userId, id, updateSkillDto);
  }

  @Delete(':id')
  remove(@Param('userId') userId: string, @Param('id') id: string) {
    return this.skillsService.remove(userId, id);
  }
}
