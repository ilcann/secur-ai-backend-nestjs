import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { AiModule } from './ai/ai.module';
import { QueuesModule } from './queues/queues.module';
import { BullModule } from '@nestjs/bullmq';
import { WebsocketsModule } from './websockets/websockets.module';
import { EntityModule } from './entity/entity.module';
import { LabelModule } from './label/label.module';
import { MaskModule } from './mask/mask.module';
import { LlmModule } from './llm/llm.module';
import { LlmProviderModule } from './llm-provider/llm-provider.module';
import { LlmModelModule } from './llm-model/llm-model.module';
import { LlmUsageModule } from './llm-usage/llm-usage.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    BullModule.forRoot({
      // TODO: Redis connection options proces.env not working
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: { attempts: 1 },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
    AiModule,
    QueuesModule,
    WebsocketsModule,
    EntityModule,
    LabelModule,
    MaskModule,
    LlmModule,
    LlmProviderModule,
    LlmModelModule,
    LlmUsageModule,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
