import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './createusersdto';
import { Skill } from './skill.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let skillRepository: Repository<Skill>;

  const mockSkill: DeepPartial<Skill> = {
    id: 'skill1',
    title: 'Skill 1',
    description: 'Description 1',
    price: 100,
    isAvailable: true,
    user: null, // Set this to null initially
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
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(mockUser as User),
            create: jest.fn().mockReturnValue(mockUser as User),
            save: jest.fn().mockResolvedValue(mockUser as User),
            delete: jest.fn().mockResolvedValue({ affected: 1 } as DeleteResult),
          },
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockImplementation(skill => skill),
            save: jest.fn().mockResolvedValue([mockSkill as Skill]),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    skillRepository = module.get<Repository<Skill>>(getRepositoryToken(Skill));

    // Associate the skill with the mockUser
    mockSkill.user = mockUser as User;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should return a single user', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
    const result = await service.findOne('testId');
    expect(result).toEqual(mockUser as User);
    expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'testId' }, relations: ['skills'] }));
  });

  it('should create a user with one skill', async () => {
    // Mock implementation to return a hashed password
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never); 
  
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'Test User',
      isAdmin: false,
      skills: [mockSkill as Skill],
    };
  
    // Creating a mock user to reflect the expected structure after save
    const mockCreatedUser = {
      ...mockUser,
      password: 'hashedPassword',
      skills: [
        {
          ...mockSkill,
          user: {
            ...mockUser,
            password: 'password', // original password before hashing
          },
        },
      ],
    };
  
    jest.spyOn(repository, 'create').mockReturnValue(mockCreatedUser as User);
    jest.spyOn(repository, 'save').mockResolvedValue(mockCreatedUser as User);
  
    const result = await service.create(createUserDto);
  
    // Adjusting the expectation to deep compare the structure
    expect(result).toMatchObject({
      email: 'test@example.com',
      isAdmin: false,
      password: 'hashedPassword',
      skills: [
        {
          ...mockSkill,
          user: expect.objectContaining({
            email: 'test@example.com',
            username: 'Test User',
            isAdmin: false,
          }),
        },
      ],
      username: 'Test User',
    });
    
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(skillRepository.create).toHaveBeenCalledTimes(1);
    expect(skillRepository.save).toHaveBeenCalledWith([mockSkill as Skill]);
    expect(repository.save).toHaveBeenCalledWith(expect.any(User));
  });

  it('should update a user', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser as User);

    const updateUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'Test User',
      isAdmin: false,
      skills: [],
    };

    const result = await service.update('testId', updateUserDto);
    expect(result).toEqual(mockUser as User);
    expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'testId' }, relations: ['skills'] }));
    expect(repository.save).toHaveBeenCalledWith(expect.anything());
  });

  it('should delete a user', async () => {
    const result = await service.delete('testId');
    expect(result).toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith('testId');
  });

  it('should throw an error if user not found for delete', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as DeleteResult);
    await expect(service.delete('invalidId')).rejects.toThrow('No user found with the provided ID.');
  });
});
