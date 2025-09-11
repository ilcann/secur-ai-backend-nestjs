import {
  Controller,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
  HttpException,
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

@Controller('chats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createChat(@Request() req: AuthenticatedRequest) {
    try {
      const ownerId = Number(req.user.id);
      const chat = await this.chatService.create(ownerId);
      if (!chat) throw new InternalServerErrorException('Chat creation failed');

      const chatDto: ChatDto = ChatMapper.toDto(chat);
      const response: CreateChatResponseDto = { chat: chatDto };

      return {
        success: true,
        message: 'Chat created successfully',
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof HttpException
            ? error.message
            : 'Registration failed',
      };
    }
  }
  @Get('recent')
  async getRecentChats(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit = 10,
  ) {
    try {
      const userId = Number(req.user.id); // Extract the user ID from the request
      const recentChats = await this.chatService.getRecentChats(userId, limit);

      const recentChatDtos: ChatDto[] = recentChats.map((chat) =>
        ChatMapper.toDto(chat),
      );

      return {
        success: true,
        message: 'Recent chats fetched successfully',
        data: recentChatDtos,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof HttpException
            ? error.message
            : 'Failed to fetch recent chats',
      };
    }
  }
}
