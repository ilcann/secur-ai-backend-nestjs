import { BadRequestException, Injectable } from '@nestjs/common';
import { AiProvider, AiProviderName, Prisma } from '@prisma/client';
import { LlmProviderRepository } from './llm-provider.repository';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LlmProviderService {
  private openAiClient: OpenAI;
  private geminiClient: GoogleGenAI;
  constructor(private readonly repository: LlmProviderRepository) {}

  async onModuleInit() {
    // Module init sırasında client’ları başlat
    const openAiProvider = await this.repository.findUnique({
      name: AiProviderName.OPENAI,
    });
    if (openAiProvider?.apiKey) {
      this.openAiClient = new OpenAI({ apiKey: openAiProvider.apiKey });
    }

    const geminiProvider = await this.repository.findUnique({
      name: AiProviderName.GEMINI,
    });
    if (geminiProvider?.apiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiProvider.apiKey });
    }
  }

  async getOne(where: Prisma.AiProviderWhereUniqueInput): Promise<AiProvider> {
    const provider = await this.repository.findUnique(where);
    if (!provider || !provider.apiKey) {
      throw new BadRequestException('Provider not active or API key missing');
    }
    return provider;
  }
}
