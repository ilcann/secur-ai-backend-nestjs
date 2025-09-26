import { Injectable } from '@nestjs/common';
import { AiProviderName } from '@prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions.js';
import { LlmModelService } from 'src/llm-model/llm-model.service';
import { LlmProviderService } from 'src/llm-provider/llm-provider.service';
import { ChatMessage } from 'src/message/dto/chat-message.dto';

@Injectable()
export class LlmService {
  constructor(
    private llmProviderService: LlmProviderService,
    private llmModelService: LlmModelService,
  ) {}

  streamResponse(
    modelName: string,
    providerName: AiProviderName,
    context: ChatMessage[],
  ) {
    switch (providerName) {
      case AiProviderName.OPENAI: {
        return this.streamResponseOpenAI(modelName, context);
      }
    }
  }
  async generateResponse(
    modelName: string,
    providerName: AiProviderName,
    context: ChatMessage[],
  ) {
    switch (providerName) {
      case AiProviderName.OPENAI: {
        return await this.generateResponseOpenAI(modelName, context);
      }
    }
  }

  private async *streamResponseOpenAI(
    modelName: string,
    context: ChatMessage[],
  ): AsyncIterable<string> {
    console.log('Streaming response from OpenAI with model:', modelName);
    console.log('Context:', context);
    const client = this.llmProviderService.getOpenAiClient();
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        ...context,
        {
          role: 'system',
          content: `Some parts of the user input are replaced with [masked label] placeholders to hide sensitive information. Treat these placeholders as opaque labels but try to reason based on context and intent.`,
        },
      ],
      stream: true,
    });
    for await (const part of response) {
      const text = part.choices?.[0]?.delta?.content;
      if (text) yield text;
    }
  }

  private async generateResponseOpenAI(
    modelName: string,
    context: ChatMessage[],
  ): Promise<string> {
    console.log('Generating response from OpenAI with model:', modelName);
    console.log('Context:', context);
    const client = this.llmProviderService.getOpenAiClient();
    const response = await client.chat.completions.create({
      model: modelName,
      messages: context as ChatCompletionMessageParam[],
    });
    return response.choices?.[0]?.message?.content ?? '';
  }

  async generateTitle(chatId: string, context: ChatMessage[]): Promise<string | null> {
    const client = this.llmProviderService.getOpenAiClient();

    const systemMessage = {
      role: 'system',
      content:
        'You are a title generator. Return a single concise title (max 60 characters) summarizing the chat content. ' +
        'Do not include quotes, metadata, or extra explanation. Return plain text only.',
    };

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...context] as ChatCompletionMessageParam[],
    });
  
    return response.choices?.[0]?.message?.content ?? null;
  }
}
