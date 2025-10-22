import { ResponseUsage } from 'src/llm/dto/response-usage';

export class RecordUsageDto {
  userId: number;
  modelId: number;
  ResponseUsage: ResponseUsage;
}
