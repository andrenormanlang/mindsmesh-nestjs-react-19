import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto, CreateUsersDto } from './createusers.dto';
import { DeleteUsersDto } from './delete.dto';
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
  @Post('bulk-create')
  async createBulk(@Body() createUsersDto: CreateUsersDto) {
    return this.usersService.createBulk(createUsersDto.users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | undefined> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    console.log(`Fetching user with ID: ${id}`);
    return this.usersService.findOne(id);
  }

  // Helper method to validate UUID
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }


  @Post('register')
  @UseInterceptors(FileInterceptor('avatar')) // Use FileInterceptor for file upload
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFiles() avatars: Express.Multer.File[], // Handle the uploaded file
  ) {
    if (avatars && avatars.length > 0) {
      // Upload avatar to Cloudinary and get the URL
      const uploadResults = await Promise.all(
        avatars.map(file => this.cloudinaryService.uploadImage(file))
      );
      createUserDto.avatarUrls = uploadResults.map(result => result.secure_url);
      console.log('Avatar uploaded successfully:', uploadResults);
  }  
    return this.usersService.create(createUserDto);
  }
  


  @Put(':id')
  async update(@Param('id') id: string, @Body() userDto: User): Promise<User> {
    return this.usersService.update(id, userDto);
  }

  // @Put(':id/skills')
  // async updateSkills(@Param('id') id: string, @Body() skills: UpdateSkillDto[]): Promise<User> {
  //   return this.usersService.updateSkills(id, skills);
  // }


  @Delete('delete-bulk')
  async deleteBulk(@Body() deleteUsersDto: DeleteUsersDto): Promise<void> {
    await this.usersService.deleteBulk(deleteUsersDto.userIds);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}

