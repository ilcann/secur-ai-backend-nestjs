import { Message } from '@prisma/client';
import { ChatMessage } from 'src/message/dto/chat-message.dto';

// llm-client.interface.ts
export interface LLMClient {
  streamResponse(aiDraft: Message, context: ChatMessage[]): Promise<string>;
}
