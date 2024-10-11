import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";

// Define a DTO for password updates
export class UpdatePasswordDto {
    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'The password for the user account',
      })
      @IsString({ message: 'Password must be a string' })
      @MinLength(8, { message: 'Password must be at least 8 characters long' })
      @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]{8,}$/, {
        message: 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character',
      })
    newPassword: string;
    
    @ApiProperty({
        example: 'YourCurrentPassword',
        description: 'The current password for the user account',
      })
      @IsString()
    currentPassword: string;
  }