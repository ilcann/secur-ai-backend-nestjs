import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiModel, Prisma } from '@prisma/client';

@Injectable()
export class LlmModelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(
    where: Prisma.AiModelWhereUniqueInput,
  ): Promise<AiModel | null> {
    return await this.prisma.aiModel.findUnique({ where });
  }

  async create(data: Prisma.AiModelCreateInput): Promise<AiModel> {
    return await this.prisma.aiModel.create({ data });
  }

  async update(id: number, data: Prisma.AiModelUpdateInput): Promise<AiModel> {
    return await this.prisma.aiModel.update({ where: { id }, data });
  }

  async findAll(): Promise<AiModel[]> {
    return await this.prisma.aiModel.findMany({
      include: {
        provider: { select: { id: true, name: true, isActive: true } },
      },
      orderBy: [{ provider: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findAllActive(): Promise<AiModel[]> {
    return await this.prisma.aiModel.findMany({
      where: { isActive: true, provider: { isActive: true } },
      include: {
        provider: { select: { id: true, name: true, isActive: true } },
      },
      orderBy: [{ provider: { name: 'asc' } }, { name: 'asc' }],
    });
  }
}
