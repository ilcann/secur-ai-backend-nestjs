import { AiModel } from '@prisma/client';
import { ModelDto } from '../dto/model.dto';

export class ModelMapper {
  static toDto(model: AiModel): ModelDto {
    return {
      id: model.id,
      name: model.name,
      providerId: model.providerId,
      isActive: Boolean(model.isActive),
      updatedAt: model.updatedAt,
    };
  }
}
