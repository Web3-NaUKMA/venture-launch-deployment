import { Message } from '../message.types';

export interface MessageSliceStateError {
  [key: string]: string | null;
}

export interface MessageSliceStateErrors {
  fetchAllMessages: string | null;
  fetchMessage: string | null;
  createMessage: string | null;
  updateMessage: string | null;
  removeMessage: string | null;
}

export interface MessageSliceState {
  messages: Message[];
  message: Message | null;
  errors: MessageSliceStateErrors;
}
