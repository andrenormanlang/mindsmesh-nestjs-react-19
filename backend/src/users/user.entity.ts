import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
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

  @Column({ default: false })
  isAdmin!: boolean;

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
