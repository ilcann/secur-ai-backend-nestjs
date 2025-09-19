import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './message.processor';
import { MessageModule } from 'src/message/message.module';
import { EntityModule } from 'src/entity/entity.module';
import { MaskModule } from 'src/mask/mask.module';
import { LlmModule } from 'src/llm/llm.module';
import { LlmModelModule } from 'src/llm-model/llm-model.module';
import { LlmProviderModule } from 'src/llm-provider/llm-provider.module';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: 'messages' }),
    EntityModule,
    MessageModule,
    MaskModule,
    LlmModule,
    LlmModelModule,
    LlmProviderModule,
  ],
  providers: [MessageProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
