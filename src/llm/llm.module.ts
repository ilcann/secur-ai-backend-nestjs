import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmModelModule } from 'src/llm-model/llm-model.module';
import { LlmProviderModule } from 'src/llm-provider/llm-provider.module';

@Module({
  imports: [LlmModelModule, LlmProviderModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
