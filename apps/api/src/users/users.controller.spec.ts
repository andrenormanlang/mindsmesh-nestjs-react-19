import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-users.dto';
import { User } from './user.entity';

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
            findOne: jest.fn().mockResolvedValue({} as User),
            createBulk: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({} as User),
            delete: jest.fn().mockResolvedValue(undefined),
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
    const result = await controller.findOne('testId');
    expect(result).toEqual({});
    expect(service.findOne).toHaveBeenCalledWith('testId');
  });

  it('should create users in bulk', async () => {
    const createUsersDto: CreateUserDto[] = [
      {
        email: 'test@example.com',
        password: 'password',
        username: 'Test User',
        isAdmin: false,
        skills: [
          {
            id: 'testSkillId',
            title: 'Test Skill',
            description: 'Test Skill Description',
            price: 100,
            isAvailable: true,
            user: {} as User,
          },
        ],
      },
    ];
    const result = await controller.createBulk({ users: createUsersDto });
    expect(result).toEqual([]);
    expect(service.createBulk).toHaveBeenCalledWith(createUsersDto);
  });

  it('should update a user', async () => {
    const updateUserDto: User = {
      id: 'testId',
      email: 'test@example.com',
      password: 'password',
      username: 'Test User',
      role: 'user',
      isAdmin: false,
      skills: [
        {
          id: 'testSkillId',
          title: 'Test Skill',
          description: 'Test Skill Description',
          price: 100,
          isAvailable: true,
          user: {} as User,
        },
      ],
    };
    const result = await controller.update('testId', updateUserDto);
    expect(result).toEqual({});
    expect(service.update).toHaveBeenCalledWith('testId', updateUserDto);
  });

  it('should delete a user', async () => {
    const result = await controller.delete('testId');
    expect(result).toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('testId');
  });
});
