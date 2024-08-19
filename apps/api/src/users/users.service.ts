import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './createusers.dto';
import { Skill } from './skill.entity';
import { v4 as uuidv4 } from 'uuid';
import { QueryFailedError } from 'typeorm';
import { UpdateUserDto } from './update.dto';


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
      userData.skills = userData.skills.map(skill => {
        if (!skill.id || skill.id.length === 0) {
          skill.id = uuidv4();  // Assign a new UUID
        }
        return skill;
      });
    }

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key value') && error.message.includes('user_email_key')) {
          throw new ConflictException('A user with this email already exists.');
        }
      }
      throw new InternalServerErrorException('An unexpected error occurred while creating the user.');
    }
  }

  // async createBulk(usersData: CreateUserDto[]): Promise<User[]> {
  //   const hashedUsers = await Promise.all(
  //     usersData.map(async (user) => {
  //       const hashedPassword = await bcrypt.hash(user.password, 10);
  //       return this.usersRepository.create({ ...user, password: hashedPassword });
  //     }),
  //   );
  //   return this.usersRepository.save(hashedUsers);
  // }

  async createBulk(usersData: CreateUserDto[]): Promise<User[]> {
    console.log('Received usersData:', usersData);

    if (!usersData || !Array.isArray(usersData)) {
        console.error('usersData is not an array:', usersData);
        throw new Error('usersData should be an array');
    }

    const hashedUsers = await Promise.all(
        usersData.map(async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
            return this.usersRepository.create(user);
        }),
    );
    return this.usersRepository.save(hashedUsers);
}

async update(id: string, userDto: UpdateUserDto): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id }, relations: ['skills'] });
  if (!user) throw new NotFoundException('User not found');

  // Hash password if provided
  if (userDto.password) {
    userDto.password = await bcrypt.hash(userDto.password, 10);
  }

  // Update the avatarUrls by replacing old URLs with the new ones
  if (userDto.avatarUrls) {
    // Replace the user's avatar URLs with the new array (possibly after some filtering/processing)
    user.avatarUrls = userDto.avatarUrls;
  }

  // Append any new skills provided
  if (userDto.skills && userDto.skills.length > 0) {
    const newSkills = await this.skillsRepository.save(
      userDto.skills.map((skillData) => this.skillsRepository.create(skillData)),
    );
    user.skills = [...user.skills, ...newSkills];
  }

  // Update other fields if provided
  if (userDto.email !== undefined) user.email = userDto.email;
  if (userDto.username !== undefined) user.username = userDto.username;
  if (userDto.role !== undefined) user.role = userDto.role;
  if (userDto.isAdmin !== undefined) user.isAdmin = userDto.isAdmin;

  return this.usersRepository.save(user);
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
