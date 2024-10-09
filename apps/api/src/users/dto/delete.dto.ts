import { IsArray, IsUUID } from 'class-validator';

export class DeleteUsersDto {
    @IsArray()
    @IsUUID(4, { each: true })
    userIds: string[];
}