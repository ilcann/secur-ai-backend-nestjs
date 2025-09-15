import { MessageEntity, MessageRole, MessageStatus } from '@prisma/client';

export type MessageDto = {
  id: number;
  role: MessageRole;
  content: string;
  maskedContent?: string;
  entities?: MessageEntity[] | [];
  status: MessageStatus;
  modelId?: number;
  createdAt: Date;
  updatedAt?: Date;
};
