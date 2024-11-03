import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
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

        // Check if a room already exists between these users
        const existingRoom = await this.roomRepository.findOne({
          where: [
            { employer: Equal(employer.id), freelancer: Equal(freelancer.id) },
            { employer: Equal(freelancer.id), freelancer: Equal(employer.id) },
          ],
        });
    
        if (existingRoom) {
          // Return the existing room instead of creating a new one
          return existingRoom;
        }

    const room = this.roomRepository.create({
      roomName,
      employer,
      freelancer,
    });

    return this.roomRepository.save(room);
  }

  async getRoomsForFreelancer(freelancerId: string): Promise<any[]> {
    const rooms = await this.roomRepository.find({
      where: { freelancer: { id: freelancerId } },
      relations: ['employer'],
    });

    return rooms.map(room => ({
      ...room,
      employerName: room.employer.username, 
    }));
  }
}

