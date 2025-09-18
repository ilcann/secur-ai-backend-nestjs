import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { AiModule } from './ai/ai.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ChatModule,
    PrismaModule,
    AuthModule,
    UserModule,
    MessageModule,
    AiModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
