import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard'; 
import { Room } from './entities/room.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '@/auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, User]), 
    JwtModule.register({}), 
    AuthModule, 
  ],
  controllers: [RoomsController],
  providers: [RoomsService, JwtAuthGuard],
  exports: [RoomsService],
})
export class RoomsModule {}
