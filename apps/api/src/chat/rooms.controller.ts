import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // Create a new room (called by an employer)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createRoom(
    @Request() req,
    @Body('freelancerId') freelancerId: string,
    @Body('roomName') roomName: string
  ) {
    const employerId = req.user.id;
    return this.roomsService.createRoom(employerId, freelancerId, roomName);
  }

  // Get rooms assigned to a freelancer
  @UseGuards(JwtAuthGuard)
  @Get('freelancer/:freelancerId')
  async getRoomsForFreelancer(@Param('freelancerId') freelancerId: string) {
    return this.roomsService.getRoomsForFreelancer(freelancerId);
  }
}
