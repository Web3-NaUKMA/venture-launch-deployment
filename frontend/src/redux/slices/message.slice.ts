import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import axios from 'axios';
import {
  MessageSliceState,
  MessageSliceStateError,
  MessageSliceStateErrors,
} from '../../types/redux/message.types';
import { CreateMessageDto, Message, UpdateMessageDto } from '../../types/message.types';
import qs from 'qs';

const initialState: MessageSliceState = {
  messages: [],
  message: null,
  errors: {
    fetchAllMessages: null,
    fetchMessage: null,
    createMessage: null,
    updateMessage: null,
    removeMessage: null,
  },
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessages: (
      state: MessageSliceState,
      action: PayloadAction<Message[]>,
    ): MessageSliceState => {
      return { ...state, messages: action.payload };
    },
    setMessage: (
      state: MessageSliceState,
      action: PayloadAction<Message | null>,
    ): MessageSliceState => {
      return { ...state, message: action.payload };
    },
    addMessage: (state: MessageSliceState, action: PayloadAction<Message>): MessageSliceState => {
      return { ...state, messages: [action.payload, ...state.messages] };
    },
    editMessage: (state: MessageSliceState, action: PayloadAction<Message>): MessageSliceState => {
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.id ? action.payload : message,
        ),
      };
    },
    deleteMessage: (state: MessageSliceState, action: PayloadAction<string>): MessageSliceState => {
      return {
        ...state,
        messages: state.messages.filter(message => message.id !== action.payload),
      };
    },
    setError: (
      state: MessageSliceState,
      action: PayloadAction<MessageSliceStateError>,
    ): MessageSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllMessages =
  (queryParams?: any, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.setError({ fetchAllMessages: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);

      const response = await axios.get(`messages/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(messageSlice.actions.setMessages(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        messageSlice.actions.setError({
          fetchAllMessages: 'Cannot fetch the list of messages.',
        }),
      );
    }
  };

export const fetchMessage =
  (id: string, queryParams?: any, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.setError({ fetchMessage: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);

      const response = await axios.get(`messages/${id}${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(messageSlice.actions.setMessage(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        messageSlice.actions.setError({
          fetchMessage: 'Cannot fetch the message with specified id.',
        }),
      );
    }
  };

export const createMessage =
  (message: CreateMessageDto, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.setError({ createMessage: null }));

    try {
      const response = await axios.post(`messages`, message);

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(messageSlice.actions.addMessage(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        messageSlice.actions.setError({
          createMessage: 'Cannot create the message with provided data.',
        }),
      );
    }
  };

export const updateMessage =
  (id: string, message: UpdateMessageDto, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.setError({ updateMessage: null }));

    try {
      const response = await axios.put(`messages/${id}`, message);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(messageSlice.actions.editMessage(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        messageSlice.actions.setError({
          updateMessage: 'Cannot update the message with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const removeMessage =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.setError({ removeMessage: null }));

    try {
      const response = await axios.delete(`messages/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(messageSlice.actions.deleteMessage(response.data.id));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        messageSlice.actions.setError({
          removeMessage: 'Cannot remove the message with specified id.',
        }),
      );
    }
  };

export const selectMessages = (state: RootState): Message[] => state.message.messages;
export const selectMessage = (state: RootState): Message | null => state.message.message;
export const selectErrors = (state: RootState): MessageSliceStateErrors => state.message.errors;

export const { setError, setMessage, setMessages, addMessage, editMessage, deleteMessage } =
  messageSlice.actions;
export default messageSlice.reducer;
