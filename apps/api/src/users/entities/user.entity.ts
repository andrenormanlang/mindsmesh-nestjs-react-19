import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';
import { IsOptional } from 'class-validator';
import { ChatMessage } from '@/chat/entities/chat-message.entity';
import { UserRole } from '../enums/user-role.enum';
import { Room } from '@/chat/entities/room.entity';

@Entity()
export class User {
  @ApiProperty({
    example: 'uuid-1234',
    description: 'The unique identifier for the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: "URL to the user's avatar image",
    required: false,
  })
  @Column({ nullable: true })
  avatarUrl?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @Column({ unique: true })
  email!: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'The username of the user',
  })
  @Column()
  username!: string;

  @ApiProperty({
    example: 'freelancer',
    description: 'The role of the user',
    enum: UserRole,
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.FREELANCER })
  role!: UserRole;

  @ApiProperty({
    example: [
      'https://example.com/image1.png',
      'https://example.com/image2.png',
    ],
    description: 'Array of image URLs associated with the users skills',
    required: false,
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  skillImageUrls?: string[];

  @ApiProperty({
    example: false,
    description: 'Indicates whether the user has administrative privileges',
    required: false,
  })
  @Column({ default: false })
  isAdmin: boolean = false;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the user has verified their email address',
    required: false,
  })
  @Column({ default: false })
  isEmailVerified!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the user is currently online',
    required: false,
  })
  @Column({ default: false })
  isOnline: boolean = false;

  // @ApiHideProperty()
  // @Column({ nullable: true })
  // emailVerificationToken?: string;

  @ApiProperty({
    type: () => Skill,
    description: 'Skills associated with the user',
    isArray: true,
  })
  @OneToMany(() => Skill, (skill) => skill.user, { cascade: true })
  @IsOptional()
  skills!: Skill[];

  // Relationships for Chat Messages
  @OneToMany(() => ChatMessage, (chat) => chat.sender)
  sentMessages!: ChatMessage[];

  @OneToMany(() => ChatMessage, (chat) => chat.receiver)
  receivedMessages!: ChatMessage[];

  @OneToMany(() => Room, (room) => room.employer)
  createdRooms!: Room[];

  @OneToMany(() => Room, (room) => room.freelancer)
  assignedRooms!: Room[];
}
