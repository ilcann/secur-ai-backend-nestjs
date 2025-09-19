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
        const { messageId, chatId, modelId, senderId } = job.data as {
          messageId: number;
          chatId: string;
          modelId: number;
          senderId: number;
        };

        const entities = await this.entityService.detectEntities(messageId);
        await this.messageService.updateMessageEntities(messageId, entities);

        await this.messageQueue.add('message.entities.updated', {
          messageId: messageId,
          chatId: chatId,
          senderId: senderId,
          modelId: modelId,
        });
        break;
      }
      case 'message.entities.updated': {
        const { messageId } = job.data as {
          messageId: number;
          chatId: string;
          senderId: number;
          modelId: number;
        };
        await this.maskService.setEntityMaskFlags(messageId);
        const maskedContent = await this.maskService.applyMask(messageId);
        await this.messageService.updateMaskedContent(messageId, maskedContent);
        await this.messageQueue.add('message.masked', {
          ...job.data,
          maskedContent,
        });
        break;
      }
      case 'message.masked': {
        const { chatId, modelId } = job.data as {
          messageId: number;
          chatId: string;
          senderId: number;
          maskedContent: string;
          modelId: number;
        };
        const aiDraft = await this.messageService.createAIDraftMessage({
          chatId,
          modelId,
        });
        await this.messageQueue.add('llm.draft.created', {
          aiDraft,
        });
        break;
      }
      case 'llm.draft.created': {
        const { aiDraft } = job.data as { aiDraft: Message };

        const context = await this.messageService.buildContext(aiDraft.chatId);

        break;
      }
    }
  }
  onCompleted(job: Job) {
    console.log('Job completed:', job);
  }
  onFailed(job: Job, err: Error) {
    console.error('Job failed:', job, err);
  }
}
