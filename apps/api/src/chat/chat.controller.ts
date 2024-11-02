import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Request,
  UseGuards,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UsersService
  ) {}

  @Post(':receiverId/send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Request() req,
    @Param('receiverId') receiverId: string,
    @Body('text') text: string,
    @Body('messageId') messageId: string
  ) {
    if (!text.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }

    console.log('Request user:', req.user); // Log the user object to debug

    try {
      const sender = await this.userService.getAuthenticatedUser(req.user.id);
      const receiver = await this.userService.findById(receiverId);

      if (!sender) {
        throw new NotFoundException(`Sender with ID ${req.user.id} not found`);
      }

      if (!receiver) {
        throw new NotFoundException(`Receiver with ID ${receiverId} not found`);
      }

      console.log(
        `Sending message from ${sender.id} to ${receiver.id}: ${text}`
      );
      return await this.chatService.sendMessageWithId(
        sender,
        receiver,
        text,
        messageId
      );
    } catch (error) {
      console.error('Error sending message:', error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId1/:userId2/messages')
  async getMessages(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string
  ) {
    if (userId1 === userId2) {
      throw new BadRequestException('Cannot retrieve messages with oneself');
    }

    try {
      // Validate that users exist
      const user1 = await this.userService.findById(userId1);
      const user2 = await this.userService.findById(userId2);

      if (!user1) {
        throw new NotFoundException(`User with ID ${userId1} not found`);
      }

      if (!user2) {
        throw new NotFoundException(`User with ID ${userId2} not found`);
      }

      // Log retrieval of messages
      console.log(
        `Retrieving messages between user ${userId1} and user ${userId2}`
      );

      return await this.chatService.getMessages(userId1, userId2);
    } catch (error) {
      console.error('Error retrieving messages:', error.message);
      throw error;
    }
  }
}
