import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';

@Entity()
export class User {
  @ApiProperty({
    example: 'uuid-1234',
    description: 'The unique identifier for the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @Column({ unique: true })
  email!: string;

  @ApiHideProperty() 
  @Column({ nullable: false })
  password!: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'The username of the user',
  })
  @Column()
  username!: string;

  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
    enum: ['admin', 'user', 'guest'], 
  })
  @Column({ default: 'user' })
  role!: string;

  @ApiProperty({
    example: [
      'https://example.com/image1.png',
      'https://example.com/image2.png',
    ],
    description: 'Array of image URLs associated with the user',
    required: false,
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  imageUrls?: string[];

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

  @ApiHideProperty()
  @Column({ nullable: true })
  emailVerificationToken?: string;

  @ApiProperty({
    type: () => Skill,
    description: 'Skills associated with the user',
    isArray: true,
  })
  @OneToMany(() => Skill, (skill) => skill.user, { cascade: true })
  skills!: Skill[];
}
