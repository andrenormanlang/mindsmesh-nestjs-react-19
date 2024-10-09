// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Ensure ConfigModule is imported
  providers: [MailService],
  exports: [MailService], // Export MailService to make it available in other modules
})
export class MailModule {}
