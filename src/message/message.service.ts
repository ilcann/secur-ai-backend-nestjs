import { Injectable } from '@nestjs/common';
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
}
