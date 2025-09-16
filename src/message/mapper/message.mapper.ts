// src/common/mappers/user.mapper.ts
import { Message, MessageEntity } from '@prisma/client';
import { MessageDto } from '../dto/message.dto';
export class MessageMapper {
  static toDto(message: Message & { entities?: MessageEntity[] }): MessageDto {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      role: message.role.toLowerCase(),
      content: message.content,
      maskedContent: message.maskedContent,
      entities: message.entities || [],
      status: message.status.toLowerCase(),
      modelId: message.modelId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
