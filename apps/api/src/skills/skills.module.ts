import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { Skill } from './skills.entity';
import { UsersModule } from '../users/users.module'; // Import the UsersModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill]),  // Register Skill entity
    UsersModule,  // Import UsersModule to access UserRepository
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}