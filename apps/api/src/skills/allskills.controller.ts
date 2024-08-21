import { Controller, Get, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class AllSkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('all')
  async getAllSkills() {
    return this.skillsService.getAllSkills();  // This returns all skill titles
  }

  @Get('search')
async searchUsersBySkill(@Query('q') query: string) {
    const users = await this.skillsService.searchUsersBySkill(query);
    return users;  // Directly return the users array
}
}