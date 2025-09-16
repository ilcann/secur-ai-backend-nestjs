import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';
import { MessageDto } from './dto/message.dto';
import type { AuthenticatedRequest } from 'src/common/dto/authenticated-request.interface';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  async getMessages(
    @Headers('x-chat-id') chatId: string,
  ): Promise<ControllerResponse<{ messages: MessageDto[] }>> {
    const messages = await this.messageService.getMessages(chatId);
    return Promise.resolve({
      data: { messages },
      message: 'Messages fetched successfully',
    });
  }

  @Post()
  async createUserMessage(
    @Headers('x-chat-id') chatId: string,
    @Headers('x-model-id') modelId: number,
    @Request() req: AuthenticatedRequest,
    @Body() body: CreateMessageDto,
  ): Promise<ControllerResponse<{ message: MessageDto }>> {
    const messages = await this.messageService.createUserMessage({
      senderId: Number(req.user.id),
      chatId,
      content: body.content,
      modelId: Number(modelId),
    });
    return Promise.resolve({
      data: { message: messages },
      message: 'Messages created successfully',
    });
  }
}
