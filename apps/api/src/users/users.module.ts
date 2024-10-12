import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { SendGridModule } from '@/sendgrid/sendgrid.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Skill]),
    CloudinaryModule,
    ConfigModule,
    SendGridModule, // Add SendGridModule
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
