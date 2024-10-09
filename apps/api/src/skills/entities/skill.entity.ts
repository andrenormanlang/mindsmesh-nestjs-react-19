import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Skill {
  @ApiProperty({
    example: 'uuid-5678',
    description: 'The unique identifier for the skill',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of the skill',
  })
  @Column()
  title!: string;

//   @ApiProperty({
//     example: 'Advanced',
//     description: 'The proficiency level of the skill',
//     enum: ['Beginner', 'Intermediate', 'Advanced'],
//   })
//   @Column()
//   level!: string;

  @ApiProperty({
    example: 'Proficient in building scalable web applications.',
    description: 'A brief description of the skill',
  })
  @Column('text')
  description!: string;

  @ApiProperty({
    example: 100,
    description: 'The price associated with the skill',
  })
  @Column('float')
  price!: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if the skill is currently available',
  })
  @Column({ default: true })
  isAvailable!: boolean;

  @ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' })
  user!: User;
}
