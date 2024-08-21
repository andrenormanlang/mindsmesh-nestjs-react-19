import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto, CreateUsersDto } from './createusers.dto';
import { DeleteUsersDto } from './delete.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { UpdateUserDto } from './update.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService // Inject CloudinaryService
  ) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post('bulk-create')
  @UseInterceptors(FilesInterceptor('imageUrls', 4)) // Assume up to 4 files
  async createBulk(
    @UploadedFiles() avatars: Express.Multer.File[],
    @Body() body: any // Use raw body instead of DTO
  ) {
    try {
      console.log('Received files:', avatars);
      console.log('Received Body:', body);

      // Manually parse the body to fit the expected DTO structure
      const createUsersDto: CreateUsersDto = {
        users: Array.isArray(body.username)
          ? body.username.map((_, index) => ({
              username: body.username[index],
              email: body.email[index],
              password: body.password[index],
              imageUrls: [], // This will be populated with Cloudinary URLs
            }))
          : [
              {
                username: body.username,
                email: body.email,
                password: body.password,
                imageUrls: [],
              },
            ],
      };

      console.log('Parsed DTO:', createUsersDto);

      // Handle file upload logic
      if (avatars && avatars.length > 0) {
        const uploadResults = await Promise.all(
          avatars.map((file) => this.cloudinaryService.uploadImage(file))
        );
        console.log('Uploaded avatars:', uploadResults);

        createUsersDto.users.forEach((userDto, index) => {
          userDto.imageUrls = uploadResults.map((result) => result.secure_url);
        });
      }

      // Continue with bulk creation
      const createdUsers = await this.usersService.createBulk(
        createUsersDto.users
      );
      console.log('Users successfully created:', createdUsers);
      return createdUsers;
    } catch (error) {
      console.error('Error in createBulk:', error);
      throw new InternalServerErrorException(
        'An error occurred during bulk user creation.'
      );
    }
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
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  @Post('register')
  @UseInterceptors(FilesInterceptor('imageUrls', 4))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFiles() avatars: Express.Multer.File[]
  ) {
    console.log('Incoming registration data:', createUserDto); // Log the incoming data
    console.log('Uploaded files:', avatars); // Log the uploaded files

    try {
      // Process avatars if any
      if (avatars && avatars.length > 0) {
        const uploadResults = await Promise.all(
          avatars.map((file) => this.cloudinaryService.uploadImage(file))
        );
        createUserDto.imageUrls = uploadResults.map(
          (result) => result.secure_url
        );
        console.log('Uploaded avatars:', createUserDto.imageUrls); // Log the URLs from Cloudinary
      }

      // Log before creating the user
      console.log('Creating user with data:', createUserDto);

      return this.usersService.create(createUserDto);
    } catch (error) {
      console.error('Error during user registration:', error.message);
      throw new BadRequestException('Registration failed.');
    }
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('avatarFiles', 4)) // Handles files
  async update(
    @Param('id') id: string,
    @Body() userDto: UpdateUserDto, // Expects DTO with URLs and files
    @UploadedFiles() avatarFiles: Express.Multer.File[]
  ): Promise<User> {
    if (avatarFiles && avatarFiles.length > 0) {
      try {
        console.log('Attempting to upload avatars:', avatarFiles);
        const uploadResults = await Promise.all(
          avatarFiles.map((file) => this.cloudinaryService.uploadImage(file))
        );
        const uploadedUrls = uploadResults.map((result) => result.secure_url);
        userDto.imageUrls = [...(userDto.imageUrls || []), ...uploadedUrls];
      } catch (error) {
        console.error('Error uploading avatars:', error);
      }
    }

    // Continue processing with other data
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
