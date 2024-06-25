import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import axios from 'axios';
import {
  ChatSliceState,
  ChatSliceStateError,
  ChatSliceStateErrors,
} from '../../types/redux/chat.types';
import { Chat } from '../../types/chat.types';
import qs from 'qs';
import { Socket } from 'socket.io-client';

const initialState: ChatSliceState = {
  chats: [],
  chat: null,
  socket: null,
  chatsUnreadMessagesCount: {},
  errors: {
    fetchAllChats: null,
    fetchChat: null,
    createChat: null,
    updateChat: null,
    removeChat: null,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state: ChatSliceState, action: PayloadAction<Chat[]>): ChatSliceState => {
      return { ...state, chats: action.payload };
    },
    setChat: (state: ChatSliceState, action: PayloadAction<Chat | null>): ChatSliceState => {
      return { ...state, chat: action.payload };
    },
    addChat: (state: ChatSliceState, action: PayloadAction<Chat>): ChatSliceState => {
      return { ...state, chats: [action.payload, ...state.chats] };
    },
    editChat: (state: ChatSliceState, action: PayloadAction<Chat>): ChatSliceState => {
      return {
        ...state,
        chats: state.chats.map(chat => (chat.id === action.payload.id ? action.payload : chat)),
      };
    },
    deleteChat: (state: ChatSliceState, action: PayloadAction<string>): ChatSliceState => {
      return {
        ...state,
        chats: state.chats.filter(chat => chat.id !== action.payload),
      };
    },
    setError: (
      state: ChatSliceState,
      action: PayloadAction<ChatSliceStateError>,
    ): ChatSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
    setSocket: (state: ChatSliceState, action: PayloadAction<Socket | null>): ChatSliceState => {
      if (action.payload === null && state.socket) {
        state.socket.disconnect?.();
      }

      return {
        ...state,
        socket: action.payload,
      };
    },
    setChatsUnreadMessagesCount: (
      state: ChatSliceState,
      action: PayloadAction<{ [key: Chat['id']]: number }>,
    ): ChatSliceState => {
      return {
        ...state,
        chatsUnreadMessagesCount: action.payload,
      };
    },
  },
});

export const fetchAllChats =
  (queryParams?: any, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(chatSlice.actions.setError({ fetchAllChats: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);

      const response = await axios.get(`chats/${query ? `?${query}` : ``}`);
      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(chatSlice.actions.setChats(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        chatSlice.actions.setError({
          fetchAllChats: 'Cannot fetch the list of chats.',
        }),
      );
    }
  };

export const fetchChat =
  (id: string, queryParams?: any, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(chatSlice.actions.setError({ fetchChat: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);

      const response = await axios.get(`chats/${id}${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(chatSlice.actions.setChat(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        chatSlice.actions.setError({
          fetchChat: 'Cannot fetch the chat with specified id.',
        }),
      );
    }
  };

export const createChat =
  (formData: FormData, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(chatSlice.actions.setError({ createChat: null }));

    try {
      const response = await axios.post(`chats`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(chatSlice.actions.addChat(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        chatSlice.actions.setError({
          createChat: 'Cannot create the chat with provided data.',
        }),
      );
    }
  };

export const updateChat =
  (id: string, formData: FormData, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(chatSlice.actions.setError({ updateChat: null }));

    try {
      const response = await axios.put(`chats/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(chatSlice.actions.editChat(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        chatSlice.actions.setError({
          updateChat: 'Cannot update the chat with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const removeChat =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(chatSlice.actions.setError({ removeChat: null }));

    try {
      const response = await axios.delete(`chats/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(chatSlice.actions.deleteChat(response.data.id));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        chatSlice.actions.setError({
          removeChat: 'Cannot remove the chat with specified id.',
        }),
      );
    }
  };

export const selectChats = (state: RootState): Chat[] => state.chat.chats;
export const selectChat = (state: RootState): Chat | null => state.chat.chat;
export const selectSocket = (state: RootState): Socket | null => state.chat.socket;
export const selectChatsUnreadMessagesCount = (state: RootState): { [key: Chat['id']]: number } =>
  state.chat.chatsUnreadMessagesCount;
export const selectErrors = (state: RootState): ChatSliceStateErrors => state.chat.errors;

export const {
  setError,
  setChat,
  setChats,
  addChat,
  editChat,
  deleteChat,
  setSocket,
  setChatsUnreadMessagesCount,
} = chatSlice.actions;
export default chatSlice.reducer;
