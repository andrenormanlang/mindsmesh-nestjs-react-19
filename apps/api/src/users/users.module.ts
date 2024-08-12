import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Skill } from './skill.entity';
import { CloudinaryModule } from './cloudinary.module';


@Module({
  imports: [TypeOrmModule.forFeature([User, Skill]), CloudinaryModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Ensure UsersService is exported
})
export class UsersModule {}
