import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Skill } from '../skills/skills.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  username!: string;

  @Column({ default: 'user' })
  role!: string;

  @Column('simple-array', { nullable: true }) // Make sure this field is nullable
  imageUrls?: string[]; // Add avatar column to store the Cloudinary URL

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean = false; // Default to false

  @OneToMany(() => Skill, (skill) => skill.user, { cascade: true }) // Define the relationship
  skills!: Skill[];
}

export class CreateUsersDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  role: string;
}
