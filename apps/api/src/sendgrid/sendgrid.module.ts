import { Module } from '@nestjs/common';
import { SendGridService } from './sendgrid.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SendGridService],
  exports: [SendGridService],
})
export class SendGridModule {}
