import { Test, TestingModule } from '@nestjs/testing';
import { SendGridService } from './sendgrid.service';

describe('SendgridService', () => {
  let service: SendGridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendGridService],
    }).compile();

    service = module.get<SendGridService>(SendGridService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
