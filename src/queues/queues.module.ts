import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './message.processor';
import { MessageModule } from 'src/message/message.module';
import { EntityModule } from 'src/entity/entity.module';
import { MaskModule } from 'src/mask/mask.module';
import { LlmModule } from 'src/llm/llm.module';
import { LlmModelModule } from 'src/llm-model/llm-model.module';
import { LlmProviderModule } from 'src/llm-provider/llm-provider.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { LlmUsageModule } from 'src/llm-usage/llm-usage.module';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: { url: configService.get<string>('bull.connection.url') },
        defaultJobOptions: {
          attempts: configService.get<number>('bull.defaultJobOptions.attempts') || 1,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'messages' }),
    EntityModule,
    MessageModule,
    MaskModule,
    LlmModule,
    LlmModelModule,
    LlmProviderModule,
    WebsocketsModule,
    LlmUsageModule,
  ],
  providers: [MessageProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
