import { Injectable } from '@nestjs/common';
import { AiProviderName } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async createProvider(name: AiProviderName, apiKey: string) {
    return this.prisma.aiProvider.create({
      data: {
        name,
        apiKey,
      },
    });
  }

  async toggleProvider(providerId: number, isActive: boolean) {
    return this.prisma.aiProvider.update({
      where: { id: providerId },
      data: { isActive },
    });
  }

  async toggleModel(modelId: number, isActive: boolean) {
    return this.prisma.aiModel.update({
      where: { id: modelId },
      data: { isActive },
    });
  }

  async listActiveProviders() {
    return this.prisma.aiProvider.findMany({ where: { isActive: true } });
  }

  async listActiveModels() {
    return this.prisma.aiModel.findMany({
      where: { isActive: true, provider: { isActive: true } },
      include: { provider: true },
    });
  }
}
