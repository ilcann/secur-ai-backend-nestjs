import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateLlmProviderDto {
  @ApiPropertyOptional({ example: 'sk-...' })
  @IsString()
  @IsOptional()
  apiKey?: string;
}
