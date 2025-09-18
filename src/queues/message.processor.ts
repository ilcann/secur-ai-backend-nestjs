import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Message } from '@prisma/client';
import { Job } from 'bullmq';
import { EntityService } from 'src/entity/entity.service';
import { MaskService } from 'src/mask/mask.service';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Processor('messages')
export class MessageProcessor extends WorkerHost {
  constructor(
    private messageService: MessageService,
    private entityService: EntityService,
    private prismaService: PrismaService,
    private maskService: MaskService,
    @InjectQueue('messages') private messageQueue: Queue,
  ) {
    super();
  }
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'user_draft.created': {
        const { message } = job.data as { message: Message };
        const entities = await this.entityService.detectEntities(message.id);
        await this.messageService.updateMessageEntities(message.id, entities);
        await this.messageQueue.add('message.entities.updated', {
          messageId: message.id,
        });
        break;
      }
      case 'message.entities.updated': {
        const { messageId } = job.data as { messageId: number };
        await this.maskService.setEntityMaskFlags(messageId);
        const maskedContent = await this.maskService.applyMask(messageId);
        await this.messageQueue.add('message.masked', {
          maskedContent: maskedContent,
        });
        break;
      }
      case 'message.masked':
        // TODO: implement actual processing logic
        console.log('Processing message masked job:', job.data);
        break;
      case 'llm.draft.created':
        // TODO: implement actual processing logic
        console.log('Processing LLM draft created job:', job.data);
        break;
    }
  }
  onCompleted(job: Job) {
    console.log('Job completed:', job);
  }
  onFailed(job: Job, err: Error) {
    console.error('Job failed:', job, err);
  }
}
