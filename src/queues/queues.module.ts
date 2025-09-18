import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './message.processor';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'messages' })],
  providers: [MessageProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
