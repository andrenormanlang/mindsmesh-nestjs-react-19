import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user-service.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Skill } from '../skills/entities/skill.entity';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { SkillDto } from './dto/skill-service.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let skillRepository: Repository<Skill>;

  const mockSkill: DeepPartial<SkillDto> = {
    title: 'Skill 1',
    description: 'Description 1',
    price: 100,
    isAvailable: true,
  };

  const mockUser: DeepPartial<User> = {
    id: 'testId',
    email: 'test@example.com',
    password: 'password',
    username: 'Test User',
    isAdmin: false,
    role: 'user',
    skills: [mockSkill],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser as User),
            create: jest.fn().mockReturnValue(mockUser as User),
            save: jest.fn().mockResolvedValue(mockUser as User),
            delete: jest
              .fn()
              .mockResolvedValue({ affected: 1 } as DeleteResult),
          },
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((skill) => skill),
            save: jest.fn().mockResolvedValue([mockSkill as Skill]),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    skillRepository = module.get<Repository<Skill>>(getRepositoryToken(Skill));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
    expect(repository.find).toHaveBeenCalledWith({ relations: ['skills'] });
  });

  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  it('should return a single user', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
    const result = await service.findOne(validUUID);
    expect(result).toEqual(mockUser as User);
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: validUUID },
        relations: ['skills'],
      })
    );
  });

  it('should create a user with one skill', async () => {
    // Mock `findByEmail` to return undefined to simulate that the user does not already exist.
    jest.spyOn(service, 'findByEmail').mockResolvedValueOnce(undefined);
  
    // Mock `bcrypt.hash` to return a hashed password
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
  
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password', 
      username: 'Test User',
      isAdmin: false,
      skills: [mockSkill as SkillDto], 
    };
  
    // Mock the created user with hashed password
    const mockCreatedUser = {
      ...mockUser,
      password: 'hashedPassword', // Ensure that the returned user object has the hashed password
      skills: [mockSkill],
    };
  
    // Mock repository methods to correctly reflect the state changes.
    jest.spyOn(repository, 'create').mockReturnValue(mockCreatedUser as User);
    jest.spyOn(repository, 'save').mockResolvedValue(mockCreatedUser as User);
  
    // Execute the create function
    const result = await service.create(createUserDto);
  
    // Assert the returned user matches what we expect
    expect(result).toMatchObject({
      email: 'test@example.com',
      isAdmin: false,
      password: 'hashedPassword', 
      skills: [
        {
          title: 'Skill 1',
          description: 'Description 1',
          price: 100,
          isAvailable: true,
        },
      ],
      username: 'Test User',
    });
  
    // Assertions for method calls
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(skillRepository.create).toHaveBeenCalledTimes(1);
    expect(skillRepository.save).toHaveBeenCalledWith([mockSkill as Skill]);
    expect(repository.save).toHaveBeenCalledWith(expect.any(User));
  });
  
  
  it('should update a user', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser as User);

    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      username: 'Updated User',
      role: 'user',
      isAdmin: false,
      skills: [
        {
          id: 'skill2',
          title: 'Skill 2',
          description: 'Description 2',
          price: 200,
          isAvailable: true,
          user: mockUser as User,
        },
      ],
    };

    const result = await service.update('testId', updateUserDto);

    expect(result).toEqual({
      ...mockUser,
      ...updateUserDto,
      skills: updateUserDto.skills, // Use updated skills
    });

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'testId' },
      relations: ['skills'],
    });
    expect(repository.save).toHaveBeenCalledWith(expect.anything());
  });

  it('should delete a user', async () => {
    const result = await service.delete('testId');
    expect(result).toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith('testId');
  });

  it('should throw an error if user not found for delete', async () => {
    jest
      .spyOn(repository, 'delete')
      .mockResolvedValue({ affected: 0 } as DeleteResult);
    await expect(service.delete('invalidId')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should update a user password', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword' as never);
    jest.spyOn(repository, 'save').mockResolvedValue({
      ...mockUser,
      password: 'newHashedPassword',
    } as User);

    await service.updatePassword('testId', 'newPassword');
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'testId' },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    expect(repository.save).toHaveBeenCalledWith({
      ...mockUser,
      password: 'newHashedPassword',
    });
  });
});
