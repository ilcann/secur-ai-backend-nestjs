// src/common/mappers/user.mapper.ts
import { Chat } from '@prisma/client';
import { ChatDto } from '../dto/chat.dto';
export class ChatMapper {
  static toDto(chat: Chat): ChatDto {
    return {
      id: chat.id,
      ownerId: chat.ownerId,
      title: chat.title,
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt,
    };
  }
}
