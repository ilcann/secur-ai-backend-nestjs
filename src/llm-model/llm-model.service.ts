import { Injectable } from '@nestjs/common';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { LlmModelRepository } from './llm-model.repository';
import { AiModel, Prisma } from '@prisma/client';

@Injectable()
export class LlmModelService {
  constructor(private readonly repo: LlmModelRepository) {}

  async createModel(data: Prisma.AiModelCreateInput) {
    return this.repo.create(data);
  }

  async listModels() {
    return this.repo.findAll();
  }

  async listActiveModels() {
    return this.repo.findAllActive();
  }

  async updateModel(id: number, dto: UpdateAiModelDto) {
    const updateData: UpdateAiModelDto = {};
    if (dto.pricePerToken !== undefined)
      updateData.pricePerToken = dto.pricePerToken;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.repo.update(id, updateData);
  }

  async getOne(where: Prisma.AiModelWhereUniqueInput): Promise<AiModel> {
    const model = await this.repo.findOne(where);
    if (!model) throw new Error('Model not found');
    return model;
  }
}
