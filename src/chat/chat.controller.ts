import {
  Controller,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from 'src/common/dto/authenticated-request.interface';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { ChatMapper } from './mapper/chat.mapper';
import { CreateChatResponseDto } from './dto/create-chat-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RecentChatsDto } from './dto/recent-chats.dto';
import { ApiResponse } from 'src/common/dto/api-response.dto';

@Controller('chats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createChat(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<CreateChatResponseDto>> {
    const ownerId = Number(req.user.id);
    const chat = await this.chatService.create(ownerId);
    if (!chat) throw new InternalServerErrorException('Chat creation failed');

    const chatDto: ChatDto = ChatMapper.toDto(chat);

    return {
      message: 'Chat created successfully',
      data: { chat: chatDto },
    };
  }
  @Get('recent')
  async getRecentChats(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit = 10,
  ): Promise<ApiResponse<RecentChatsDto>> {
    const userId = Number(req.user.id); // Extract the user ID from the request
    const recentChats = await this.chatService.getRecentChats(userId, limit);

    const recentChatDtos: ChatDto[] = recentChats.map((chat) =>
      ChatMapper.toDto(chat),
    );

    return {
      message: 'Recent chats fetched successfully',
      data: { chats: recentChatDtos },
    };
  }
}
