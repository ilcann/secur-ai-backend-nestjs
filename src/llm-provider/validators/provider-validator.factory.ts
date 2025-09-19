// src/ai-provider/validators/provider-validator.factory.ts
import { AiProviderName } from '@prisma/client';
import { OpenAIValidator } from './openai.validator';
import { GeminiAIValidator } from './gemini.validator';

export class ProviderValidatorFactory {
  static getValidator(provider: AiProviderName): {
    validate(apiKey: string): Promise<boolean>;
  } {
    switch (provider) {
      case AiProviderName.OPENAI:
        return new OpenAIValidator();
      case AiProviderName.GEMINI:
        return new GeminiAIValidator();
      default:
        throw new Error(`No validator defined for provider: ${provider}`);
    }
  }
}
