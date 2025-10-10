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
import { EntityDto } from 'src/entity/dto/entity.dto';
import { ResponseUsage } from 'src/llm/dto/response-usage';

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
          entities: entities,
        });
        break;
      }
      case 'message.entities.updated': {
        const { messageId, chatId, senderId, entities } = job.data as {
          messageId: number;
          chatId: string;
          senderId: number;
          modelId: number;
          entities: EntityDto[];
        };
        await this.maskService.setEntityMaskFlags(messageId);
        const maskedContent = await this.maskService.applyMask(messageId);
        await this.messageService.updateMaskedContent(messageId, maskedContent);
        this.chatGateway.server.to(String(senderId)).emit('message.masked', {
          chatId,
          senderId,
          maskedContent,
          entities,
        });
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
          chatId,
          senderId,
          aiDraft,
        });
        await this.prismaService.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

        this.chatGateway.server
          .to(String(senderId))
          .emit('llm.draft.created', { message: aiDraft });
        break;
      }
      case 'llm.draft.created': {
        const { chatId, senderId, aiDraft } = job.data as {
          chatId: string;
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
        let usage: ResponseUsage | null = null;
        let text: string | null = null;

        // Capture usage from the first chunk
        for await (const chunk of stream!) {
          if (chunk.usage && !usage) usage = chunk.usage;
          if (chunk.text) {
            text = chunk.text;
            fullResponse += text;
            this.chatGateway.server
              .to(String(senderId))
              .emit('llm.stream.chunk', { chatId, chunk });
          }
        }

        await this.messageQueue.add('llm.stream.completed', {
          chatId,
          senderId,
          aiDraftId: aiDraft.id,
          fullResponse,
          usage,
          modelId: aiDraft.modelId,
        });
        break;
      }
      case 'llm.stream.completed': {
        const { chatId, senderId, aiDraftId, fullResponse, usage, modelId } =
          job.data as {
            chatId: string;
            aiDraftId: number;
            fullResponse: string;
            senderId: number;
            usage: ResponseUsage | null;
            modelId: number;
          };

        // Finalize the AI draft message by updating its content
        await this.messageService.completeAiDraft(aiDraftId, fullResponse);
        this.chatGateway.server
          .to(String(senderId))
          .emit('llm.stream.completed', {
            chatId,
          });
        await this.prismaService.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

        // Record usage
        if (usage && usage.input_tokens !== 0 && usage.output_tokens !== 0) {
          await this.prismaService.aiUsage.create({
            data: {
              userId: senderId,
              modelId: modelId,
              tokenType: 'INPUT',
              tokens: usage ? usage.input_tokens : 0,
            },
          });
          await this.prismaService.aiUsage.create({
            data: {
              userId: senderId,
              modelId: modelId,
              tokenType: 'OUTPUT',
              tokens: usage ? usage.output_tokens : 0,
            },
          });
        }

        // Ensure chat has a proper title
        await this.messageQueue.add('chat.ensure.title', {
          chatId,
          senderId,
        });
        break;
      }
      case 'chat.ensure.title': {
        const { chatId, senderId } = job.data as {
          chatId: string;
          senderId: number;
        };

        // Check if chat title is still the default "New Chat"
        const chat = await this.prismaService.chat.findUnique({
          where: { id: chatId },
        });
        if (!chat) break;
        if (chat.title !== 'New Chat') break; // Title already exists

        // Generate a title using the LLM service
        const context = await this.messageService.buildContext(chatId);
        const title = await this.llmService.generateTitle(context);
        if (title) {
          await this.prismaService.chat.update({
            where: { id: chatId },
            data: { title },
          });
          this.chatGateway.server
            .to(String(senderId))
            .emit('chat.title.updated', {
              chatId,
              title,
            });
        }
      }
    }
  }
}
