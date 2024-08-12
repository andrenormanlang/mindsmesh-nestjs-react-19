import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto, CreateUsersDto } from './createusersdto';
import { DeleteUsersDto } from './deletedto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';


@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService, // Inject CloudinaryService
  ) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | undefined> {
    console.log(`Fetching user with ID: ${id}`);
    return this.usersService.findOne(id);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar')) // Use FileInterceptor for file upload
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar: Express.Multer.File, // Handle the uploaded file
  ) {
    if (avatar) {
      // Upload avatar to Cloudinary and get the URL
      const uploadResult = await this.cloudinaryService.uploadImage(avatar);
      createUserDto.avatar = uploadResult.secure_url; // Store the Cloudinary URL in the DTO
      console.log('Avatar uploaded successfully:', uploadResult);

    }
    
    return this.usersService.create(createUserDto);
  }

  @Post('bulk-create')
  async createBulk(@Body() createUsersDto: CreateUsersDto) {
    return this.usersService.createBulk(createUsersDto.users);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userDto: User): Promise<User> {
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

