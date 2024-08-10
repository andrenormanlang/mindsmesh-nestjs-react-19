import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './createusersdto';
import { Skill } from './skill.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Skill) // Assuming you have a Skill entity
    private skillsRepository: Repository<Skill>
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const newUser = new User();
    newUser.email = userData.email;
    newUser.username = userData.username;
    newUser.password = await bcrypt.hash(userData.password, 10);
    newUser.isAdmin = userData.isAdmin;
    newUser.skills = [];

    for (const skillData of userData.skills) {
      const newSkill = this.skillsRepository.create(skillData);
      newUser.skills.push(newSkill);
    }

    await this.skillsRepository.save(newUser.skills); // Save skills first if needed
    return this.usersRepository.save(newUser); // Save the user with associated skills
  }

  async createBulk(usersData: CreateUserDto[]): Promise<User[]> {
    const hashedUsers = usersData.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return this.usersRepository.create({ ...user, password: hashedPassword });
    });
    const resolvedUsers = await Promise.all(hashedUsers);
    return this.usersRepository.save(resolvedUsers);
  }

  async update(id: string, userDto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['skills'] });
    if (!user) throw new Error('User not found');

    // Handle password update
    if (userDto.password) {
        const hashedPassword = await bcrypt.hash(userDto.password, 10);
        userDto.password = hashedPassword;
    } else {
        delete userDto.password;
    }

    // Handle skills update
    if (userDto.skills && userDto.skills.length > 0) {
        user.skills = [...user.skills, ...userDto.skills];
    }

    return this.usersRepository.save({ ...user, ...userDto });
}


  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('No user found with the provided ID.');
    }
  }
  async deleteBulk(userIds: string[]): Promise<void> {
    await this.usersRepository.delete(userIds);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['skills'],  
    });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['skills'],  // Include the 'skills' relation
    });
  }
}
