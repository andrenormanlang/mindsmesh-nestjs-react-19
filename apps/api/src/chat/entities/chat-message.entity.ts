import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ChatMessage {
  @ApiProperty({
    example: 'uuid-5678',
    description: 'The unique identifier for the chat message',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'The content of the chat message',
  })
  @Column({ type: 'text' })
  message!: string;

  @ApiProperty({
    example: 'uuid-1234',
    description: 'The ID of the user who sent the message',
  })
  @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
  sender!: User;

  @ApiProperty({
    example: 'uuid-5678',
    description: 'The ID of the user who received the message',
  })
  @ManyToOne(() => User, (user) => user.receivedMessages, { eager: true })
  receiver!: User;

  @ApiProperty({
    example: '2024-10-28T12:34:56Z',
    description: 'The time when the message was created',
  })
  @CreateDateColumn()
  createdAt!: Date;
}