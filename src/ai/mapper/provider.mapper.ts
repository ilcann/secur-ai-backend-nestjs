import { AiProvider } from '@prisma/client';
import { ProviderDto } from '../dto/provider.dto';

export class ProviderMapper {
  static toDto(provider: AiProvider): ProviderDto {
    return {
      id: provider.id,
      name: provider.name,
      isActive: Boolean(provider.isActive),
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}
