import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
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

  async findMessageById(id: string): Promise<ChatMessage | null> {
    const message = await this.chatRepository.findOne({ where: { id } });
    return message || null;
  }

  async sendMessageWithId(sender: User, receiver: User, message: string, id: string): Promise<ChatMessage> {
    const chatMessage = this.chatRepository.create({
      id,  // Set the unique ID for the message
      sender,
      receiver,
      message,
    });
    const savedMessage = await this.chatRepository.save(chatMessage);
    console.log("Saved message with createdAt:", savedMessage.createdAt);
    return savedMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    if (userId1 === userId2) {
      throw new BadRequestException('User cannot retrieve messages with themselves');
    }
  
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

  async getActiveChats(userId: string): Promise<User[]> {
    const messages = await this.chatRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
    });
  
    const chatPartnersMap = new Map<string, User>();
  
    messages.forEach((message) => {
      const otherUser =
        message.sender.id === userId ? message.receiver : message.sender;
      if (otherUser.role === 'employer') {
        chatPartnersMap.set(otherUser.id, otherUser);
      }
    });
  
    return Array.from(chatPartnersMap.values());
  }
  
}
