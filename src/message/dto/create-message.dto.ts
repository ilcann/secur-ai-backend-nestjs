import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello assistant!' })
  @IsString()
  content: string;
}
