import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Message } from '@prisma/client';
import { Job } from 'bullmq';
import { EntityService } from 'src/entity/entity.service';
import { MaskService } from 'src/mask/mask.service';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LlmService } from 'src/llm/llm.service';
import { LlmProviderService } from 'src/llm-provider/llm-provider.service';
import { LlmModelService } from 'src/llm-model/llm-model.service';
import { ChatGateway } from 'src/websockets/chat.gateway';

@Processor('messages')
export class MessageProcessor extends WorkerHost {
  constructor(
    private messageService: MessageService,
    private entityService: EntityService,
    private prismaService: PrismaService,
    private maskService: MaskService,
    private llmService: LlmService,
    private llmProviderService: LlmProviderService,
    private llmModelService: LlmModelService,
    private chatGateway: ChatGateway,
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
        const { senderId, chatId, modelId } = job.data as {
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
          senderId,
          aiDraft,
        });
        break;
      }
      case 'llm.draft.created': {
        const { senderId, aiDraft } = job.data as {
          senderId: number;
          aiDraft: Message;
        };

        const context = (
          await this.messageService.buildContext(aiDraft.chatId)
        ).slice(0, -1);

        const model = await this.llmModelService.getOne({
          id: aiDraft.modelId,
        });
        const provider = await this.llmProviderService.getOne({
          id: model.providerId,
        });

        const stream = this.llmService.streamResponse(
          model.name,
          provider.name,
          context,
        );
        let fullResponse = '';
        for await (const chunk of stream!) {
          console.log('Stream chunk:', chunk);
          fullResponse += chunk;
        }

        await this.messageQueue.add('llm.stream.completed', {
          senderId,
          aiDraftId: aiDraft.id,
          fullResponse,
        });
        break;
      }
      case 'llm.stream.completed': {
        const { aiDraftId, fullResponse, senderId } = job.data as {
          aiDraftId: number;
          fullResponse: string;
          senderId: number;
        };
        const message = await this.messageService.completeAiDraft(
          aiDraftId,
          fullResponse,
        );
        this.chatGateway.server
          .to(String(senderId))
          .emit('ai.stream.completed', {
            messageId: aiDraftId,
            message,
          });
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
