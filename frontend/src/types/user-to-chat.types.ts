import { Chat } from './chat.types';
import { User } from './user.types';

export interface UserToChat {
  userId: string;
  chatId: string;
  user: User;
  chat: Chat;
}
