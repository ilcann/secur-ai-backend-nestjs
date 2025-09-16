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
  async getRecentChats(
    userId: number,
    limit = 10,
    offset = 0,
  ): Promise<Chat[]> {
    return this.prisma.chat.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'asc' },
      take: limit,
      skip: offset,
    });
  }
}
