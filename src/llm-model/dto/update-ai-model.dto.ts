import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAiModelDto {
  @ApiPropertyOptional({
    description: 'Price per token for the model',
    example: 0.000002,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  pricePerToken?: number;

  @ApiPropertyOptional({
    description: 'Whether the model is active and selectable',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
