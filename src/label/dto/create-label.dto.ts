import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({
    description: 'Unique key identifier for the entity label',
    example: 'PERSON_NAME',
    pattern: '^[A-Z_]+$',
  })
  @IsNotEmpty({ message: 'Key must not be empty' })
  @IsString({ message: 'Key must be a string' })
  @Matches(/^[A-Z_]+$/, { message: 'Key must match the pattern ^[A-Z_]+$' })
  key: string;

  @ApiProperty({
    description: 'Human-readable name for the entity label',
    example: 'Person Name',
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(100, { message: 'Name must be at most 100 characters long' })
  name: string;

  @ApiProperty({
    description: 'Optional description explaining the entity label usage',
    example: 'Used to identify and mask person names in text',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, {
    message: 'Description must be at most 500 characters long',
  })
  description?: string;
}
