import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageMapper } from './mapper/message.mapper';
import { MessageDto } from './dto/message.dto';
import {
  Message,
  MessageEntity,
  MessageRole,
  MessageStatus,
} from '@prisma/client';
import { EntityDto } from 'src/entity/dto/entity.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ChatMessage } from './dto/chat-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('messages') private messageQueue: Queue,
  ) {}

  async getOne(messageId: number): Promise<Message> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  async getOneWithEntities(
    messageId: number,
  ): Promise<Message & { entities: MessageEntity[] }> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { entities: true },
    });
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  getMessages(chatId: string): Promise<MessageDto[]> {
    const messages = this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: { entities: true },
    });
    const messageDtos = messages.then((msgs) =>
      msgs.map((msg) => MessageMapper.toDto(msg)),
    );
    return messageDtos;
  }

  async createUserMessage(data: {
    chatId: string;
    content: string;
    senderId: number;
    modelId: number;
  }): Promise<MessageDto> {
    const lastMessage = await this.prisma.message.findFirst({
      where: { chatId: data.chatId },
      orderBy: { createdAt: 'desc' },
    });
    if (lastMessage && lastMessage.role === MessageRole.USER) {
      throw new BadRequestException(
        'Cannot create user message: last message is also from user',
      );
    }
    const message = await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        modelId: data.modelId || 1, // Default to model ID 1 for user messages
        senderId: data.senderId,
        content: data.content,
        role: MessageRole.USER,
        status: MessageStatus.CREATED,
      },
    });
    return MessageMapper.toDto(message);
  }
  createAIDraftMessage(data: {
    chatId: string;
    modelId: number;
  }): Promise<Message> {
    return this.prisma.message.create({
      data: {
        senderId: 2, // System user ID
        chatId: data.chatId,
        modelId: data.modelId,
        content: '',
        role: MessageRole.ASSISTANT,
        status: MessageStatus.CREATED,
      },
    });
  }

  async updateMessageEntities(messageId: number, entities: EntityDto[]) {
    // Replace existing entities with the provided list atomically to avoid duplicates
    await this.prisma.$transaction(async (tx) => {
      await tx.messageEntity.deleteMany({ where: { messageId } });
      if (entities.length > 0) {
        await tx.messageEntity.createMany({
          data: entities.map((e) => ({
            messageId,
            entityLabelId: e.entityLabelId,
            value: e.value,
            start: e.start,
            end: e.end,
            maskedValue: e.maskedValue,
          })),
        });
      }
    });
  }

  async updateMaskedContent(
    messageId: number,
    maskedContent: string,
  ): Promise<Message> {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { maskedContent, status: 'MASKED' },
    });
  }

  async buildContext(chatId: string, limit = 20): Promise<ChatMessage[]> {
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const ordered = messages.reverse();

    return ordered.map((msg) => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.role === MessageRole.USER ? msg.maskedContent : msg.content,
    }));
  }

  async completeAiDraft(aiDraftId: number, fullResponse: string) {
    return this.prisma.message.update({
      where: { id: aiDraftId },
      data: { content: fullResponse, status: 'COMPLETED' },
    });
  }

  async getLastMessage(chatId: string): Promise<MessageDto> {
    const message = await this.prisma.message.findFirst({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
    });
    if (!message) {
      throw new Error('Message not found');
    }
    return MessageMapper.toDto(message);
  }
}
