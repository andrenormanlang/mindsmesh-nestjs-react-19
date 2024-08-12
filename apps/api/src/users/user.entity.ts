import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Skill } from './skill.entity';

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

  @Column({ nullable: true })  // Make sure this field is nullable
  avatar?: string;  // Add avatar column to store the Cloudinary URL

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean = false; // Default to false

  @OneToMany(() => Skill, (skill) => skill.user, { cascade: true })
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
