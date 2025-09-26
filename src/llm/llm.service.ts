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
    const client = this.llmProviderService.getOpenAiClient();

    const systemMessage = {
      role: 'system',
      content: `You are an assistant that receives chat messages where sensitive details (such as names, emails, phone numbers, IDs, etc.)
  are replaced with placeholders like [PERSON_NAME] or [EMAIL]. 

  Treat these placeholders as opaque tokens — do not try to infer, expand, or reconstruct hidden information. 
  Focus only on the conversation intent and context. 
  Always generate a helpful, natural response as if the placeholders were just normal words in the text.`,
    };

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [systemMessage, ...context] as ChatCompletionMessageParam[],
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
        'You are a title generator. Return a single concise title (max 4 words) summarizing the chat content. ' +
        'Do not include quotes, metadata, or extra explanation. Return plain text only.' +
        'Always respond with a title, never say "no title" or similar.' +
        'Only about the content of the chat, do not make up any information.',
    };

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...context] as ChatCompletionMessageParam[],
    });
  
    return response.choices?.[0]?.message?.content ?? null;
  }
}
