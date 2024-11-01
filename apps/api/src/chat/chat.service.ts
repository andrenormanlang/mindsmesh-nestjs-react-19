import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: Repository<ChatMessage>,

    @InjectRepository(User) // Inject the User repository
    private userRepository: Repository<User>,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async sendMessage(sender: User, receiver: User, message: string): Promise<ChatMessage> {
    const chatMessage = this.chatRepository.create({
      sender,
      receiver,
      message,
    });
    const savedMessage = await this.chatRepository.save(chatMessage);
    console.log("Saved message with createdAt:", savedMessage.createdAt);
    return savedMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return this.chatRepository.find({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
