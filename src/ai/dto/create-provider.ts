import { AiProviderName } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsEnum(AiProviderName)
  name: AiProviderName;

  @IsString()
  apiKey: string;
}
