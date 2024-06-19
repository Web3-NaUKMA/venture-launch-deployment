import { Message } from './message.types';
import { UserToChat } from './user-to-chat.types';
import { User } from './user.types';

export interface Chat {
  id: string;
  name: string | null;
  image: string | null;
  description: string | null;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
  usersToChat: UserToChat[];
  archivedBy: User[];
  favouriteFor: User[];
  messages: Message[];
}

export interface ChatUserDto {
  id: string;
}

export interface CreateChatDto {
  name?: string | null;
  image?: string | null;
  description?: string | null;
  isGroup?: boolean;
  usersToAdd?: ChatUserDto[];
}

export interface UpdateChatDto {
  name?: string | null;
  image?: string | null;
  description?: string | null;
  isGroup?: boolean;
  updatedAt?: Date | null;
  removedAt?: Date | null;
  usersToAdd?: ChatUserDto[];
  usersToUpdate?: ChatUserDto[];
  usersToRemove?: ChatUserDto[];
}
