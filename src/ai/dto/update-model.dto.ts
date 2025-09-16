import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateModelDto {
  @ApiProperty({ description: 'Is the model active?', example: true })
  @IsBoolean()
  isActive: boolean;
}
