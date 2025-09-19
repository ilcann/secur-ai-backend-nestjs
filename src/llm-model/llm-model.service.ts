import { Injectable } from '@nestjs/common';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { LlmModelRepository } from './llm-model.repository';

@Injectable()
export class LlmModelService {
  constructor(private readonly repo: LlmModelRepository) {}

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
}
