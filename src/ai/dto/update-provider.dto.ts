import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProviderDto {
  @ApiProperty({ description: 'Is the provider active?', example: true })
  @IsBoolean()
  isActive: boolean;
}
