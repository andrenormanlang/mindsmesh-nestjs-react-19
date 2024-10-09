// src/skills/skills.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UsersService } from '../users/users.service';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly usersService: UsersService, // Inject UsersService
  ) {}

  async create(userId: string, createSkillDto: CreateSkillDto): Promise<Skill> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skill = this.skillsRepository.create({
      ...createSkillDto,
      user: user,
    });
    const savedSkill = await this.skillsRepository.save(skill);
    console.log(`Created skill with ID ${savedSkill.id} for user ${userId}`);
    return savedSkill;
  }

  async findAll(userId: string): Promise<Skill[]> {
    return this.skillsRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(userId: string, id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id, user: { id: userId } },
    });
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

  // Search users by skill
  async searchUsersBySkill(query: string): Promise<User[]> {
    const skills = await this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.user', 'user')
      .where('skill.title ILIKE :query', { query: `%${query}%` })
      .orWhere('skill.description ILIKE :query', { query: `%${query}%` })
      .getMany();

    console.log('Generated Query:', skills);

    const uniqueUsers = new Map<string, User>();
    skills.forEach(skill => {
      if (skill.user) {
        uniqueUsers.set(skill.user.id, skill.user);
      }
    });

    return Array.from(uniqueUsers.values());
  }

  // Get all skill titles
  async getAllSkills(): Promise<{ title: string }[]> {
    return this.skillsRepository
      .createQueryBuilder('skill')
      .select('skill.title')
      .getRawMany();
  }
}
