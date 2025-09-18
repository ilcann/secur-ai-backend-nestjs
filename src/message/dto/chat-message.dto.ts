// llm unified context's Message format
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};
