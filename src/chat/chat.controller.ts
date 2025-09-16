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
import { ControllerResponse } from 'src/common/dto/controller-response.dto';

@Controller('chats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createChat(
    @Request() req: AuthenticatedRequest,
  ): Promise<ControllerResponse<CreateChatResponseDto>> {
    const ownerId = Number(req.user.id);
    const chat = await this.chatService.create(ownerId);
    if (!chat) throw new InternalServerErrorException('Chat creation failed');

    const chatDto: ChatDto = ChatMapper.toDto(chat);

    return Promise.resolve({
      message: 'Chat created successfully',
      data: { chat: chatDto },
    });
  }
  @Get('recent')
  async getRecentChats(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<ControllerResponse<RecentChatsDto>> {
    const userId = Number(req.user.id); // Extract the user ID from the request
    const recentChats = await this.chatService.getRecentChats(
      userId,
      limit,
      offset,
    );

    const recentChatDtos: ChatDto[] = recentChats.map((chat) =>
      ChatMapper.toDto(chat),
    );

    return Promise.resolve({
      message: 'Recent chats fetched successfully',
      data: { chats: recentChatDtos },
    });
  }
}
