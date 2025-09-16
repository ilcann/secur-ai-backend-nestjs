import { IsBoolean } from 'class-validator';

export class UpdateModelDto {
  @IsBoolean()
  isActive: boolean;
}
