import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './createusers.dto';
import { Skill } from './skill.entity';
import { QueryFailedError } from 'typeorm';
import { UpdateSkillDto } from './createskill.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create({
      email: userData.email,
      username: userData.username,
      password: await bcrypt.hash(userData.password, 10),
      isAdmin: userData.isAdmin,
      avatarUrls: userData.avatarUrls,
    });

    if (userData.skills && userData.skills.length > 0) {
      newUser.skills = await this.skillsRepository.save(
        userData.skills.map((skillData) => this.skillsRepository.create(skillData)),
      );
    }

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Check for specific error code or message that indicates a unique constraint violation
        if (error.message.includes('duplicate key value') && error.message.includes('user_email_key')) {
          throw new ConflictException('A user with this email already exists.');
        }
      }
      // Re-throw any other error as an internal server error
      throw new InternalServerErrorException('An unexpected error occurred while creating the user.');
    }
  }

  async createBulk(usersData: CreateUserDto[]): Promise<User[]> {
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return this.usersRepository.create({ ...user, password: hashedPassword });
      }),
    );
    return this.usersRepository.save(hashedUsers);
  }

  async update(id: string, userDto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['skills'] });
    if (!user) throw new NotFoundException('User not found');

    if (userDto.password) {
      userDto.password = await bcrypt.hash(userDto.password, 10);
    } else {
      delete userDto.password;
    }

    if (userDto.skills && userDto.skills.length > 0) {
      const newSkills = await this.skillsRepository.save(
        userDto.skills.map((skillData) => this.skillsRepository.create(skillData)),
      );
      user.skills = [...user.skills, ...newSkills];
    }

    return this.usersRepository.save({ ...user, ...userDto });
  }

  async updateSkills(userId: string, skills: UpdateSkillDto[]): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['skills'] });
    
    if (!user) throw new NotFoundException('User not found');
  
    // Assuming you want to replace all existing skills
    await this.skillsRepository.delete({ user: { id: userId } });
  
    const updatedSkills = await this.skillsRepository.save(
      skills.map(skillData => this.skillsRepository.create({ ...skillData, user })),
    );
  
    user.skills = updatedSkills;
    return this.usersRepository.save(user);
  }

  async updateSkill(skillId: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findSkillById(skillId);
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
  
    Object.assign(skill, updateSkillDto);
    return this.skillsRepository.save(skill);
  }

  async updateUserWithSkills(userId: string, userDto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['skills'] });
    if (!user) throw new NotFoundException('User not found');

    if (userDto.password) {
      userDto.password = await bcrypt.hash(userDto.password, 10);
    } else {
      delete userDto.password;
    }

    if (userDto.skills && userDto.skills.length > 0) {
        // Update the skills
        const updatedSkills = await this.skillsRepository.save(
            userDto.skills.map((skillData) => {
                const existingSkill = user.skills.find(skill => skill.id === skillData.id);
                if (existingSkill) {
                    // Update existing skill
                    return this.skillsRepository.create({ ...existingSkill, ...skillData });
                } else {
                    // Add new skill
                    return this.skillsRepository.create({ ...skillData, user });
                }
            })
        );
        user.skills = updatedSkills;
    }

    return this.usersRepository.save({ ...user, ...userDto });
}

  

  async findSkillById(id: string): Promise<Skill | undefined> {
    return this.skillsRepository.findOne({ where: { id } });
  }
  

  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No user found with the provided ID.');
    }
  }

  async deleteBulk(userIds: string[]): Promise<void> {
    await this.usersRepository.delete(userIds);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['skills'] });
  }

  async findOne(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['skills'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
