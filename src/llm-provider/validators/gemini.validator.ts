import { GoogleGenAI } from '@google/genai';

export class GeminiAIValidator {
  async validate(apiKey: string): Promise<boolean> {
    const gemini = new GoogleGenAI({ apiKey: apiKey });
    try {
      await gemini.models.list();
      return true;
    } catch (error: any) {
      console.error('Gemini key validation error:', error.message);
      return false;
    }
  }
}