import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AiProvider, AiProviderName, Prisma } from '@prisma/client';
import { LlmProviderRepository } from './llm-provider.repository';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { ProviderValidatorFactory } from './validators/provider-validator.factory';
import { LlmModelService } from 'src/llm-model/llm-model.service';

@Injectable()
export class LlmProviderService {
  private openAiClient: OpenAI;
  private geminiClient: GoogleGenAI;
  constructor(
    private readonly repo: LlmProviderRepository,
    private readonly llmModelService: LlmModelService,
  ) {}

  async onModuleInit() {
    const provider = await this.repo.findUnique({
      name: AiProviderName.GEMINI,
    });
    if (provider?.apiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: provider.apiKey });
    } else {
      console.warn('GEMINI API key not found, Gemini client not initialized.');
    }

    const openAiProvider = await this.repo.findUnique({
      name: AiProviderName.OPENAI,
    });
    if (openAiProvider?.apiKey) {
      this.openAiClient = new OpenAI({ apiKey: openAiProvider.apiKey });
    } else {
      console.warn('OPENAI API key not found, OpenAI client not initialized.');
    }
  }

  async getOne(where: Prisma.AiProviderWhereUniqueInput): Promise<AiProvider> {
    const provider = await this.repo.findUnique(where);
    if (!provider || !provider.apiKey) {
      throw new BadRequestException('Provider not active or API key missing');
    }
    return provider;
  }

  private async ensureProviderDoesNotExist(name: AiProviderName) {
    const existing = await this.repo.findUnique({ name });
    if (existing)
      throw new ConflictException(`Provider "${name}" already exists`);
  }

  private async validateApiKey(name: AiProviderName, apiKey: string) {
    const validator = ProviderValidatorFactory.getValidator(name);
    const isValid = await validator.validate(apiKey);
    if (!isValid)
      throw new BadRequestException(`Invalid API key for "${name}"`);
  }

  private async deactivateProvider(name: AiProviderName) {
    await this.repo.update({ name }, { isActive: false, apiKey: '' });
  }

  private initializeProviderClient(provider: AiProvider, apiKey: string) {
    if (provider.name === AiProviderName.OPENAI)
      this.openAiClient = new OpenAI({ apiKey });
    if (provider.name === AiProviderName.GEMINI)
      this.geminiClient = new GoogleGenAI({ apiKey });
  }
  getOpenAiClient(): OpenAI {
    if (!this.openAiClient) throw new Error('OpenAI client not initialized');
    return this.openAiClient;
  }

  getGenAiClient(): GoogleGenAI {
    if (!this.geminiClient) throw new Error('Gemini client not initialized');
    return this.geminiClient;
  }
  private async fetchOpenAiModels(): Promise<string[]> {
    const list = await this.openAiClient.models.list();
    return list.data.map((m) => m.id);
  }

  private async fetchGenAiModels(): Promise<string[]> {
    const modelsPager = await this.geminiClient.models.list();
    const models: string[] = [];

    for await (const model of modelsPager) {
      if (model.name && model.supportedActions?.includes('generateContent')) {
        models.push(model.name.replace(/^models\//, ''));
      }
    }

    return models;
  }

  private async fetchProviderModels(
    where: Prisma.AiProviderWhereUniqueInput,
  ): Promise<string[]> {
    const provider = await this.getOne(where);

    if (!provider || !provider.isActive || !provider.apiKey) {
      throw new BadRequestException('Provider not active or API key missing');
    }

    switch (provider.name) {
      case 'OPENAI':
        return await this.fetchOpenAiModels();
      case 'GEMINI':
        return await this.fetchGenAiModels();
      default:
        return [];
    }
  }

  async addModelsToProvider(name: AiProviderName, providerId: number) {
    const models = await this.fetchProviderModels({ name: name });
    await Promise.allSettled(
      models.map((modelName) =>
        this.llmModelService.createModel({
          name: modelName,
          providerId: providerId,
        }),
      ),
    );
  }

  async createProvider(
    data: Prisma.AiProviderCreateInput,
  ): Promise<AiProvider> {
    await this.ensureProviderDoesNotExist(data.name);
    await this.validateApiKey(data.name, data.apiKey);
    const provider = await this.repo.create(data);
    await this.addModelsToProvider(data.name, provider.id);
    this.initializeProviderClient(provider, data.apiKey);
    return provider;
  }
}
