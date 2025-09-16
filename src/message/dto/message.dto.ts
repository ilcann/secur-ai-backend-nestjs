import { MessageEntity } from '@prisma/client';

export type MessageDto = {
  id: number;
  chatId: string;
  senderId: number;
  role: string;
  content: string;
  maskedContent?: string;
  entities?: MessageEntity[] | [];
  status: string;
  modelId?: number;
  createdAt: Date;
  updatedAt?: Date;
};
