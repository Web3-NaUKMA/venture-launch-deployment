import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import {
  IUserSliceState,
  IUserSliceStateError,
  IUserSliceStateErrors,
} from '../../types/redux/user.types';
import axios from 'axios';
import { ICreateUser, IUpdateUser, IUser } from '../../types/user.types';
import { RequestQueryParams } from '../../types/app.types';
import { serializeQueryParams } from '../../utils/request.utils';

const initialState: IUserSliceState = {
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
    setUsers: (state: IUserSliceState, action: PayloadAction<IUser[]>): IUserSliceState => {
      return { ...state, users: action.payload };
    },
    setUser: (state: IUserSliceState, action: PayloadAction<IUser | null>): IUserSliceState => {
      return { ...state, user: action.payload };
    },
    addUser: (state: IUserSliceState, action: PayloadAction<IUser>): IUserSliceState => {
      return { ...state, users: [action.payload, ...state.users] };
    },
    editUser: (state: IUserSliceState, action: PayloadAction<IUser>): IUserSliceState => {
      return {
        ...state,
        users: state.users.map(user => (user.id === action.payload.id ? action.payload : user)),
      };
    },
    deleteUser: (state: IUserSliceState, action: PayloadAction<string>): IUserSliceState => {
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    },
    setError: (
      state: IUserSliceState,
      action: PayloadAction<IUserSliceStateError>,
    ): IUserSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllUsers =
  (queryParams?: RequestQueryParams, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ fetchAllUsers: null }));

    try {
      const query = queryParams ? serializeQueryParams(queryParams) : undefined;
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
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ fetchUser: null }));

    try {
      const response = await axios.get(`users/${id}`);

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
  (User: ICreateUser, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ createUser: null }));

    try {
      const response = await axios.post(`users`, User);

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
  (id: string, User: IUpdateUser, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(userSlice.actions.setError({ updateUser: null }));

    try {
      const response = await axios.put(`users/${id}`, User);

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

export const selectUsers = (state: RootState): IUser[] => state.user.users;
export const selectUser = (state: RootState): IUser | null => state.user.user;
export const selectErrors = (state: RootState): IUserSliceStateErrors => state.user.errors;

export const { setError, setUser, setUsers, addUser, editUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;
