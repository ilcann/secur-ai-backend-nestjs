import { ApiProperty } from '@nestjs/swagger';
export class NerEntityDto {
  @ApiProperty({ example: 'John Doe' })
  text: string;

  @ApiProperty({ example: 'PERSON_NAME' })
  label: string;

  @ApiProperty({ example: 0 })
  start: number;

  @ApiProperty({ example: 8 })
  end: number;
}
