import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './message.processor';
import { MessageModule } from 'src/message/message.module';
import { EntityModule } from 'src/entity/entity.module';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: 'messages' }),
    EntityModule,
    MessageModule,
  ],
  providers: [MessageProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
