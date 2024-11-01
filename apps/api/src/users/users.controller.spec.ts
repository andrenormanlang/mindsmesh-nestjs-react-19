import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { DeepPartial } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { SkillDto } from '@/users/dto/skill-service.dto';
import _ from 'lodash';
import { CreateUsersDto } from './dto/create-users-test';
import { Skill } from '@/skills/entities/skill.entity';
import { UserRole } from './enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest
              .fn()
              .mockResolvedValue({
                id: 'testId',
                password: 'hashedPassword',
              } as User),
            createBulk: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({} as User),
            delete: jest.fn().mockResolvedValue(undefined),
            updatePassword: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest
              .fn()
              .mockResolvedValue({
                secure_url: 'https://example.com/image.jpg',
              }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single user', async () => {
    const validUuid = uuidv4();
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({ id: validUuid, password: 'hashedPassword' } as User);
    const result = await controller.findOne(validUuid);

    expect(result).toEqual({ id: validUuid, password: 'hashedPassword' });
    expect(service.findOne).toHaveBeenCalledWith(validUuid);
  });

  it('should create users in bulk', async () => {
    // Create a mock skill without a user reference to avoid circular references
    const mockSkill: DeepPartial<SkillDto> = {
      title: 'Skill 1',
      description: 'Description 1',
      price: 100,
      isAvailable: true,
    };
  
    // Mock the createUsersDto array
    const createUsersDto: CreateUsersDto = {
      users: [
        {
          email: 'test@example.com',
          password: 'password',
          username: 'Test User',
          role: UserRole.FREELANCER,
          isAdmin: false,
          skills: [mockSkill as SkillDto],
        },
      ],
    };
  
    // Create a copy of the data without circular references (using JSON stringify/parse trick)
    const copiedCreateUsersDto = JSON.parse(JSON.stringify(createUsersDto));
  
    // Mock the result after creation in the service
    const generatedUserId = uuidv4(); // Simulate a generated user ID
  
    const createdUsers: DeepPartial<User>[] = [
      {
        id: generatedUserId,
        email: createUsersDto.users[0].email,
        username: createUsersDto.users[0].username,
        isAdmin: createUsersDto.users[0].isAdmin,
        password: 'hashedPassword', // Assume password would be hashed by the service
        role: createUsersDto.users[0].role,
        skills: [mockSkill as Skill], // No reference to the user itself here
      },
    ];
  
    // Mock the createBulk service method
    // jest.spyOn(service, 'createBulk').mockResolvedValue(createdUsers);
  
    // Call the controller method and check the result
    const result = await controller.createBulk([], copiedCreateUsersDto);
  
    // Assertions
    expect(result).toEqual(createdUsers);
    expect(service.createBulk).toHaveBeenCalledWith(copiedCreateUsersDto);
  });
  

  it('should update a user', async () => {
    const validUuid = uuidv4();

    const updateUserDto: User = {
      id: validUuid,
      email: 'test@example.com',
      password: 'password',
      username: 'Test User',
      role: UserRole.FREELANCER,
      isAdmin: false,
      skills: [],
      isEmailVerified: true,
      isOnline: false,
      sentMessages: [],
      receivedMessages: []
    };
    
    const result = await controller.update(validUuid, updateUserDto, []);
    expect(result).toEqual({});
    expect(service.update).toHaveBeenCalledWith(validUuid, updateUserDto);
  });

  it('should delete a user', async () => {
    const validUuid = uuidv4();
    const expectedResult = { message: 'User successfully deleted' }; 
    
    const result = await controller.delete(validUuid);
  
    expect(result).toEqual(expectedResult);
    expect(service.delete).toHaveBeenCalledWith(validUuid);
  });
  
  it('should update a user password', async () => {
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newStrongPassword1!',
    };

    // Mock bcrypt comparison for password verification
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({
        id: 'testId',
        password: 'hashedOldPassword',
      } as User);
    jest.spyOn(service, 'updatePassword').mockResolvedValue(undefined);

    // Mock bcrypt compare to always return true for this example
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(true));

    const result = await controller.updatePassword('testId', updatePasswordDto);
    expect(result).toEqual({ message: 'Password successfully updated' });
    expect(service.findOne).toHaveBeenCalledWith('testId');
    expect(service.updatePassword).toHaveBeenCalledWith(
      'testId',
      updatePasswordDto.newPassword
    );
  });

  it('should throw an error if current password is incorrect', async () => {
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'wrongPassword',
      newPassword: 'newStrongPassword1!',
    };

    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({
        id: 'testId',
        password: 'hashedOldPassword',
      } as User);
    jest.spyOn(service, 'updatePassword').mockResolvedValue(undefined);

    // Fixing the type error by casting properly
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(false));

    await expect(
      controller.updatePassword('testId', updatePasswordDto)
    ).rejects.toThrow(BadRequestException);
    expect(service.findOne).toHaveBeenCalledWith('testId');
  });
});
