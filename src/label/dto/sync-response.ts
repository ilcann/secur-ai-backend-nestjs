import { ApiProperty } from '@nestjs/swagger';

export class SyncResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({
    example: ['PERSON_NAME', 'EMAIL', 'PHONE_NUMBER'],
    isArray: true,
    type: String,
  })
  synced_labels: string[];
}
