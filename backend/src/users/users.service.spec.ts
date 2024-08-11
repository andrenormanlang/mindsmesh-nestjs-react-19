import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './createusersdto';
import { Skill } from './skill.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let skillRepository: Repository<Skill>;

  const mockUser: User = {
    id: 'testId',
    email: 'test@example.com',
    password: 'password',
    username: 'Test User',
    isAdmin: false,
    role: 'user',
    skills: [
      { id: 'skill1', title: 'Skill 1', description: 'Description 1', price: 100, isAvailable: true },
      { id: 'skill2', title: 'Skill 2', description: 'Description 2', price: 200, isAvailable: true },
    ],
  };
  const mockUser2: User = {
    id: 'testId',
    email: 'test@example.com',
    password: 'password',
    username: 'Test User',
    isAdmin: true,
    role: 'admin',
    skills: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            delete: jest.fn().mockResolvedValue({ affected: 1 } as DeleteResult),
          },
        },
        {
          provide: getRepositoryToken(Skill), // Mock Skill repository
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    skillRepository = module.get<Repository<Skill>>(getRepositoryToken(Skill));
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
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
    const result = await service.findOne('testId');
    expect(result).toEqual(mockUser);
    expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'testId' }, relations: ['skills'] }));
  });

  it('should create a user with skills', async () => {
    // Mock implementation to return a hashed password
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
  
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'Test User',
      isAdmin: false,
      skills: [
        { id: 'skill1', title: 'Skill 1', description: 'Description 1', price: 100, isAvailable: true, user: mockUser },
        { id: 'skill2', title: 'Skill 2', description: 'Description 2', price: 200, isAvailable: true, user: mockUser2 },
      ],
    };
  
    const mockSkill1 = { ...createUserDto.skills[0] };
    const mockSkill2 = { ...createUserDto.skills[1] };
    const mockUser = {
      id: 'testId',
      ...createUserDto,
      password: 'hashedPassword',
      skills: [mockSkill1, mockSkill2]
    };
  
    jest.spyOn(repository, 'create').mockReturnValue(mockUser);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser);
    jest.spyOn(skillRepository, 'create').mockImplementation(skill => skill);
    jest.spyOn(skillRepository, 'save').mockResolvedValue([mockSkill1, mockSkill2]);
  
    const result = await service.create(createUserDto);
  
    expect(result).toEqual(mockUser);
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(skillRepository.create).toHaveBeenCalledTimes(2);
    expect(skillRepository.save).toHaveBeenCalledWith([mockSkill1, mockSkill2]);
    expect(repository.save).toHaveBeenCalledWith(mockUser);
  });
D  

  it('should update a user', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

    const updateUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'Test User',
      isAdmin: false,
      skills: [],
    };

    const result = await service.update('testId', updateUserDto);
    expect(result).toEqual(mockUser);
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
