import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiProvider, Prisma } from '@prisma/client';

@Injectable()
export class LlmProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.AiProviderWhereUniqueInput,
  ): Promise<AiProvider | null> {
    return this.prisma.aiProvider.findUnique({ where });
  }

  async findMany() {
    return this.prisma.aiProvider.findMany({
      include: { models: true },
    });
  }

  async create(data: Prisma.AiProviderCreateInput): Promise<AiProvider> {
    return this.prisma.aiProvider.create({ data });
  }

  async update(
    where: Prisma.AiProviderWhereUniqueInput,
    data: Prisma.AiProviderUpdateInput,
  ): Promise<AiProvider> {
    return this.prisma.aiProvider.update({ where, data });
  }

  async delete(where: Prisma.AiProviderWhereUniqueInput): Promise<AiProvider> {
    return this.prisma.aiProvider.delete({ where });
  }
}
