import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
    id: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean; 
}
