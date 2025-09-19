import { OpenAI } from 'openai';

export class OpenAIValidator {
  async validate(apiKey: string): Promise<boolean> {
    const openai = new OpenAI({ apiKey: apiKey });
    try {
      await openai.models.list();
      return true;
    } catch (error: any) {
      console.error('OpenAI key validation error:', error.message);
      return false;
    }
  }
}