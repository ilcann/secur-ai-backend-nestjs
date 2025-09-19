import { Module } from '@nestjs/common';
import { LlmProviderService } from './llm-provider.service';
import { LlmProviderRepository } from './llm-provider.repository';

@Module({
  controllers: [],
  providers: [LlmProviderService, LlmProviderRepository],
})
export class LlmProviderModule {}
