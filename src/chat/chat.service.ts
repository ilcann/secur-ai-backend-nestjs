import { Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  async create(ownerId: number): Promise<Chat> {
    const chat = await this.prisma.chat.create({
      data: { ownerId },
    });
    return chat;
  }
}
