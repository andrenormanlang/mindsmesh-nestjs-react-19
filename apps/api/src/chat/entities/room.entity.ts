import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roomName: string;

  @ManyToOne(() => User, (user) => user.createdRooms, { eager: true })
  employer!: User;

  @ManyToOne(() => User, (user) => user.assignedRooms, { eager: true })
  freelancer!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages!: ChatMessage[];
}
