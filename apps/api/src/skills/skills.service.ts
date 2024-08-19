import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skills.entity';
import { User } from '../users/user.entity';  // Import the User entity
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UsersService } from '../users/users.service';  // Import the UsersService

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly usersService: UsersService,  // Inject UsersService
  ) {}

  async create(userId: string, createSkillDto: CreateSkillDto): Promise<Skill> {
    const user = await this.usersService.findOne(userId);  // Fetch the user
    const skill = this.skillsRepository.create({
      ...createSkillDto,
      user,  // Associate the skill with the user
    });
    const savedSkill = await this.skillsRepository.save(skill);
    console.log(`Created skill with ID ${savedSkill.id} for user ${userId}`);
    return savedSkill;
  }
  

  async findAll(userId: string): Promise<Skill[]> {
    return this.skillsRepository.find({ where: { user: { id: userId } } });  // Fetch skills for a specific user
  }

  async findOne(userId: string, id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({ where: { id, user: { id: userId } } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found for user ${userId}`);
    }
    return skill;
  }

  async update(userId: string, id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(userId, id);
    Object.assign(skill, updateSkillDto);
    return this.skillsRepository.save(skill);
  }

  async remove(userId: string, id: string): Promise<void> {
    const skill = await this.findOne(userId, id);
    await this.skillsRepository.remove(skill);
  }
}
