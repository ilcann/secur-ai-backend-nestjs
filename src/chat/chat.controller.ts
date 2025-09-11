import {
  Controller,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from 'src/common/dto/authenticated-request.interface';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { ChatMapper } from './mapper/chat.mapper';
import { CreateChatResponseDto } from './dto/create-chat-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chat')
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
}
