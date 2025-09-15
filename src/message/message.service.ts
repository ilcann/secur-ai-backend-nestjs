import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageMapper } from './mapper/message.mapper';
import { MessageDto } from './dto/message.dto';
import { MessageRole, MessageStatus } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}
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
}
