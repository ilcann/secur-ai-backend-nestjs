import { Module } from '@nestjs/common';
import { LlmProviderService } from './llm-provider.service';
import { LlmProviderRepository } from './llm-provider.repository';
import { LlmProviderController } from './llm-provider.controller';
import { LlmModelModule } from 'src/llm-model/llm-model.module';

@Module({
  imports: [LlmModelModule],
  controllers: [LlmProviderController],
  providers: [LlmProviderService, LlmProviderRepository],
  exports: [LlmProviderService, LlmProviderRepository],
})
export class LlmProviderModule {}
