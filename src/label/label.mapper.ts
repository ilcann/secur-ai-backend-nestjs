import { EntityLabel } from '@prisma/client';
import { LabelDto } from './dto/label.dto';

export class LabelMapper {
  static toDto(label: EntityLabel): LabelDto {
    return {
      id: label.id,
      name: label.name,
      key: label.key,
      description: label.description,
    };
  }
}
