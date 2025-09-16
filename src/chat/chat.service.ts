import { Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  async create(ownerId: number): Promise<Chat> {
    const chat = await this.prisma.chat.create({
      data: { ownerId, title: 'New Chat' },
    });
    return chat;
  }

  async totalChats(userId: number): Promise<number> {
    return this.prisma.chat.count({ where: { ownerId: userId } });
  }

  async getChats(userId: number, limit = 10, offset = 0): Promise<Chat[]> {
    const chats = await this.prisma.chat.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return chats;
  }
}
