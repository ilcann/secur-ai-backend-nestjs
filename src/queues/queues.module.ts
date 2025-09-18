import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './message.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'messages' })],
  providers: [MessageProcessor],
})
export class QueuesModule {}
