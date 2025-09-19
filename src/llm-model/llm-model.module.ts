import { Module } from '@nestjs/common';
import { LlmModelService } from './llm-model.service';
import { LlmModelRepository } from './llm-model.repository';
import { LlmModelController } from './llm-model.controller';

@Module({
  providers: [LlmModelService, LlmModelRepository],
  exports: [LlmModelService, LlmModelRepository],
  controllers: [LlmModelController],
})
export class LlmModelModule {}
