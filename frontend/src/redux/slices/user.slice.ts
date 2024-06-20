import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import {
  UserSliceState,
  UserSliceStateError,
  UserSliceStateErrors,
} from '../../types/redux/user.types';
import axios from 'axios';
import { CreateUserDto, User } from '../../types/user.types';
import qs from 'qs';

const initialState: UserSliceState = {
  users: [],
  user: null,
  errors: {
    fetchAllUsers: null,
    fetchUser: null,
    createUser: null,
    updateUser: null,
    removeUser: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state: UserSliceState, action: PayloadAction<User[]>): UserSliceState => {
      return { ...state, users: action.payload };
    },
    setUser: (state: UserSliceState, action: PayloadAction<User | null>): UserSliceState => {
      return { ...state, user: action.payload };
    },
    addUser: (state: UserSliceState, action: PayloadAction<User>): UserSliceState => {
      return { ...state, users: [action.payload, ...state.users] };
    },
    editUser: (state: UserSliceState, action: PayloadAction<User>): UserSliceState => {
      return {
        ...state,
        users: state.users.map(user => (user.id === action.payload.id ? action.payload : user)),
      };
    },
    deleteUser: (state: UserSliceState, action: PayloadAction<string>): UserSliceState => {
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    },
    setError: (
      state: UserSliceState,
      action: PayloadAction<UserSliceStateError>,
    ): UserSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllUsers =
  (queryParams?: any, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ fetchAllUsers: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);
      const response = await axios.get(`users/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(userSlice.actions.setUsers(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(userSlice.actions.setError({ fetchAllUsers: 'Cannot fetch the list of users.' }));
    }
  };

export const fetchUser =
  (id: string, queryParams?: any, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ fetchUser: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);
      const response = await axios.get(`users/${id}${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(userSlice.actions.setUser(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        userSlice.actions.setError({
          fetchUser: 'Cannot fetch the user with specified id.',
        }),
      );
    }
  };

export const createUser =
  (user: CreateUserDto, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ createUser: null }));

    try {
      const response = await axios.post(`users`, user);

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(userSlice.actions.addUser(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        userSlice.actions.setError({
          createUser: 'Cannot create the user with provided data.',
        }),
      );
    }
  };

export const updateUser =
  (id: string, formData: FormData, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ updateUser: null }));

    try {
      const response = await axios.put(`users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(userSlice.actions.editUser(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        userSlice.actions.setError({
          updateUser: 'Cannot update the user with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const removeUser =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ removeUser: null }));

    try {
      const response = await axios.delete(`users/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(userSlice.actions.deleteUser(response.data.id));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        userSlice.actions.setError({
          removeUser: 'Cannot remove the user with specified id.',
        }),
      );
    }
  };

export const selectUsers = (state: RootState): User[] => state.user.users;
export const selectUser = (state: RootState): User | null => state.user.user;
export const selectErrors = (state: RootState): UserSliceStateErrors => state.user.errors;

export const { setError, setUser, setUsers, addUser, editUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;
