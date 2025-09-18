import { ApiProperty } from '@nestjs/swagger';

export class LabelDto {
  @ApiProperty({
    description: 'Unique identifier of the entity label',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Human-readable name for the entity label',
    example: 'Person Name',
  })
  name: string;

  @ApiProperty({
    description: 'Unique key identifier for the entity label',
    example: 'PERSON_NAME',
  })
  key: string;

  @ApiProperty({
    description: 'Optional description explaining the entity label usage',
    example: 'Used to identify and mask person names in text',
    required: false,
    nullable: true,
  })
  description?: string | null;
}
