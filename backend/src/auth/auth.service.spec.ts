import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Import UsersService
import { JwtService } from '@nestjs/jwt'; // Import JwtService

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() }, // Mock UsersService
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() }, // Mock JwtService
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

