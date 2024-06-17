import { Chat } from './chat.interface';
import { User } from './user.interface';

export interface Message {
  id: string;
  author: User;
  chat: Chat;
  content: string;
  createdAt: Date;
  updatedAt?: Date | null;
  removedAt?: Date | null;
}
