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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ChatGateway } from 'src/websockets/chat.gateway';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private chatGateway: ChatGateway,
    @InjectQueue('messages') private messageQueue: Queue,
  ) {}

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
    const message = await this.messageService.createUserMessage({
      senderId: Number(req.user.id),
      chatId,
      content: body.content,
      modelId: Number(modelId),
    });

    await this.messageQueue.add('user_draft.created', {
      message: message,
      messageId: message.id,
      chatId: message.chatId,
      modelId: message.modelId,
      senderId: message.senderId,
    });

    return Promise.resolve({
      data: { message: message },
      message: 'Messages created successfully',
    });
  }

  @Get('last')
  async getLastMessage(
    @Headers('x-chat-id') chatId: string,
  ): Promise<ControllerResponse<{ message: MessageDto }>> {
    const message = await this.messageService.getLastMessage(chatId);
    return Promise.resolve({
      data: { message: message },
      message: 'Last message fetched successfully',
    });
  }
}
