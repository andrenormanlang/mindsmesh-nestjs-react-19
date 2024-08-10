import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto, CreateUsersDto } from './createusersdto';
import { DeleteUsersDto } from './deletedto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | undefined> {
    return this.usersService.findOne(id);
  }

  @Post('bulk-create')
  async createBulk(@Body() createUsersDto: CreateUsersDto) {
    return this.usersService.createBulk(createUsersDto.users);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userDto: CreateUserDto): Promise<User> {
    return this.usersService.update(id, userDto);
  }

  @Delete('delete-bulk')
  async deleteBulk(@Body() deleteUsersDto: DeleteUsersDto): Promise<void> {
    await this.usersService.deleteBulk(deleteUsersDto.userIds);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
