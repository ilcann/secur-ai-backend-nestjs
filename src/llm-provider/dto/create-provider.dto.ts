import { ApiProperty } from '@nestjs/swagger';
import { AiProviderName } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ enum: AiProviderName })
  @IsEnum(AiProviderName)
  name: AiProviderName;

  @ApiProperty({ example: 'sk-...' })
  @IsString()
  apiKey: string;
}
