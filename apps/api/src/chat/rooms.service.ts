import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRoom(employerId: string, freelancerId: string, roomName: string): Promise<Room> {
    const employer = await this.userRepository.findOne({ where: { id: employerId } });
    const freelancer = await this.userRepository.findOne({ where: { id: freelancerId } });

    if (!employer || !freelancer) {
      throw new Error('Employer or freelancer not found');
    }

    const room = this.roomRepository.create({
      roomName,
      employer,
      freelancer,
    });

    return this.roomRepository.save(room);
  }

  async getRoomsForFreelancer(freelancerId: string): Promise<Room[]> {
    return this.roomRepository.find({
      where: { freelancer: { id: freelancerId } },
      relations: ['employer'],
    });
  }
}
