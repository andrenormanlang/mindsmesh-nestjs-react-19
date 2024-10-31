import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '@/users/users.module';
import { ChatController } from './chat.controller';
import { AuthModule } from '@/auth/auth.module'; // Import AuthModule to reuse its JwtModule
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    UsersModule,
    AuthModule, // Import AuthModule that has JwtModule properly registered
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [ChatService, ChatGateway, JwtService, ConfigService], // Ensure JwtService is in providers
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}

