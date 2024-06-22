import { Chat } from '../chat.types';

export interface ChatSliceStateError {
  [key: string]: string | null;
}

export interface ChatSliceStateErrors {
  fetchAllChats: string | null;
  fetchChat: string | null;
  createChat: string | null;
  updateChat: string | null;
  removeChat: string | null;
}

export interface ChatSliceState {
  chats: Chat[];
  chat: Chat | null;
  socket: any | null;
  chatsUnreadMessagesCount: { [key: Chat['id']]: number };
  errors: ChatSliceStateErrors;
}
