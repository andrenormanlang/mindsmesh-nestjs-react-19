import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user-service.dto';
import { Skill } from '../skills/entities/skill.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email }, relations: ['skills'] });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if the email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
    // Create a new user instance
    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      isAdmin: createUserDto.isAdmin,
      imageUrls: createUserDto.imageUrls,
    });
  
    // Save the user first
    const savedUser = await this.usersRepository.save(newUser);
  
    // Now create and associate skills if provided
    if (createUserDto.skills && createUserDto.skills.length > 0) {
      const skills = createUserDto.skills.map(skillDto => 
        this.skillsRepository.create({
          ...skillDto,
          user: savedUser,
        })
      );
      savedUser.skills = await this.skillsRepository.save(skills);
    }
  
    // Return the user with associated skills
    return this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['skills'],
    });
  }

  async createBulk(usersData: CreateUserDto[]): Promise<User[]> {
    console.log('Received usersData:', usersData);

    if (!usersData || !Array.isArray(usersData)) {
      console.error('usersData is not an array:', usersData);
      throw new ConflictException('Invalid data format for bulk creation.');
    }

    const users = await Promise.all(
      usersData.map(async (userDto) => {
        // Check for existing email
        const existingUser = await this.findByEmail(userDto.email);
        if (existingUser) {
          throw new ConflictException(`A user with email ${userDto.email} already exists.`);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userDto.password, 10);

        // Create user instance
        const user = this.usersRepository.create({
          email: userDto.email,
          username: userDto.username,
          password: hashedPassword,
          isAdmin: userDto.isAdmin,
          imageUrls: userDto.imageUrls,
        });

        // Associate skills
        if (userDto.skills && userDto.skills.length > 0) {
          const skills = userDto.skills.map(skillDto => {
            return this.skillsRepository.create({
              ...skillDto,
              user: user,
            });
          });
          user.skills = await this.skillsRepository.save(skills);
        }

        return this.usersRepository.save(user);
      })
    );

    return users;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['skills'],
    });
  
    if (!user) throw new NotFoundException('User not found');
  
    // Log current user details before updating
    console.log('Current user details:', {
      email: user.email,
      username: user.username,
      role: user.role,
      isAdmin: user.isAdmin,
      imageUrls: user.imageUrls,
      password: user.password,
    });
  
    // Update fields if provided
    if (updateUserDto.email) {
      console.log(`Updating email for user ${user.id} from ${user.email} to ${updateUserDto.email}`);
      user.email = updateUserDto.email;
    }
    if (updateUserDto.username) {
      console.log(`Updating username for user ${user.id} from ${user.username} to ${updateUserDto.username}`);
      user.username = updateUserDto.username;
    }
    if (updateUserDto.role) {
      console.log(`Updating role for user ${user.id} from ${user.role} to ${updateUserDto.role}`);
      user.role = updateUserDto.role;
    }
    if (updateUserDto.isAdmin !== undefined) {
      console.log(`Updating isAdmin for user ${user.id} from ${user.isAdmin} to ${updateUserDto.isAdmin}`);
      user.isAdmin = updateUserDto.isAdmin;
    }
    if (updateUserDto.imageUrls) {
      console.log(`Updating imageUrls for user ${user.id}`);
      user.imageUrls = updateUserDto.imageUrls;
    }
    if (updateUserDto.password) {
      console.log(`Updating password for user ${user.id}. Current hashed password: ${user.password}`);
      user.password = await bcrypt.hash(updateUserDto.password, 10);
      console.log(`New hashed password for user ${user.id}: ${user.password}`);
    }
  
    // Add new skills if provided
    if (updateUserDto.skills && updateUserDto.skills.length > 0) {
      console.log(`Adding new skills for user ${user.id}`);
      const skills = updateUserDto.skills.map(skillDto => {
        return this.skillsRepository.create({
          ...skillDto,
          user: user,
        });
      });
      user.skills = [...user.skills, ...(await this.skillsRepository.save(skills))];
    }
  
    try {
      // Save the updated user
      const updatedUser = await this.usersRepository.save(user);
      console.log('User updated successfully:', {
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        imageUrls: updatedUser.imageUrls,
        password: updatedUser.password,
      });
  
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('An error occurred while updating the user.');
    }
  }
  

  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No user found with the provided ID.');
    }
  }

  async deleteBulk(userIds: string[]): Promise<void> {
    const result = await this.usersRepository.delete(userIds);
    if (result.affected === 0) {
      throw new NotFoundException('No users found with the provided IDs.');
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['skills'] });
  }

  async findOne(id: string): Promise<User> {
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
