import { ChatDto } from './chat.dto';
export class RecentChatsDto {
  chats: ChatDto[];
  hasMore: boolean;
  nextOffset: number;
}
