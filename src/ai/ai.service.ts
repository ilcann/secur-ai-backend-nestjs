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
  async findProvider(id: number) {
    return this.prisma.aiProvider.findUnique({ where: { id } });
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

  async listModels() {
    return this.prisma.aiModel.findMany();
  }

  async listProviders() {
    return this.prisma.aiProvider.findMany();
  }

  async listActiveProviders() {
    return this.prisma.aiProvider.findMany({ where: { isActive: true } });
  }

  async listActiveModels() {
    return this.prisma.aiModel.findMany({
      where: { isActive: true, provider: { isActive: true } },
    });
  }
}
