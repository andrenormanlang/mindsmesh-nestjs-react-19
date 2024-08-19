import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('float')
  price!: number;

  @Column({ default: true })
  isAvailable!: boolean;

  @ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' })  // Define the relationship
  user!: User;
}
