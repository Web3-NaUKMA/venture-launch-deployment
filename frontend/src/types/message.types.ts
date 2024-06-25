import { Chat } from './chat.types';
import { User } from './user.types';

export interface Message {
  id: string;
  isPinned: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
  replyTo: Message | null;
  author: User;
  chat: Chat;
  replies: Message[];
  seenBy: User[];
}

export interface CreateMessageDto {
  author: { id: string };
  chat: { id: string };
  replyTo?: { id: string } | null;
  content: string;
}

export interface UpdateMessageDto {
  content?: string;
  isPinned?: boolean;
  updatedAt?: Date | null;
  removedAt?: Date | null;
  seenBy?: string;
}
