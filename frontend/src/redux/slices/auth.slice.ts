import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  IAuthSliceState,
  IAuthSliceStateError,
  IAuthSliceStateErrors,
} from '../../types/redux/auth.types';
import { IUser } from '../../types/user.types';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { IActionCreatorOptions } from '../../types/redux/store.types';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { IAccountRegistrationData } from '../../types/app.types';
import bs58 from 'bs58';
import axios from 'axios';

const initialState: IAuthSliceState = {
  user: null,
  errors: {
    login: null,
    register: null,
    fetchAuthenticatedUser: null,
    logout: null,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser: (
      state: IAuthSliceState,
      action: PayloadAction<IUser | null>,
    ): IAuthSliceState => {
      return { ...state, user: action.payload };
    },
    unsetAuthenticatedUser: (state: IAuthSliceState): IAuthSliceState => {
      return { ...state, user: null };
    },
    setError: (
      state: IAuthSliceState,
      action: PayloadAction<IAuthSliceStateError>,
    ): IAuthSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const login =
  (wallet: WalletContextState, options?: IActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(authSlice.actions.setError({ login: null }));

    try {
      const publicKey = wallet.publicKey;
      if (!publicKey || !wallet.signMessage) {
        throw new Error('The wallet public key is missing. Cannot authorize the user.');
      }

      const message = import.meta.env.VITE_AUTH_MESSAGE;
      const messageBytes = new TextEncoder().encode(message);
      const signMessageResponse = await wallet.signMessage(messageBytes);
      const bs58encodedPublicKey = wallet.publicKey?.toBase58();
      const bs58encodedPayload = bs58.encode(new TextEncoder().encode(JSON.stringify({ message })));
      const signature = bs58.encode(signMessageResponse);
      const token = `${bs58encodedPublicKey}.${bs58encodedPayload}.${signature}`;

      const response = await axios.post(`auth/login`, { publicKey, token });

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(authSlice.actions.setAuthenticatedUser(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(authSlice.actions.setError({ login: 'The user is unauthorized.' }));
    }
  };

export const register =
  (wallet: WalletContextState, data: IAccountRegistrationData, options?: IActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(authSlice.actions.setError({ register: null }));
    try {
      const response = await axios.post(`auth/register`, data);

      if (response.status === HttpStatusCode.Created) {
        return dispatch(login(wallet, options));
      }
    } catch (error) {
      options?.onError?.(error);
      return dispatch(
        authSlice.actions.setError({
          register: 'The user with provided walletId, username or email already exists.',
        }),
      );
    }
  };

export const fetchAuthenticatedUser =
  (options?: IActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(authSlice.actions.setError({ fetchAuthenticatedUser: null }));

    try {
      const response = await axios.get(`auth/user`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(authSlice.actions.setAuthenticatedUser(response.data));
      } else if (response.status === HttpStatusCode.Unauthorized) {
        throw new Error('The user is unauthorized.');
      }
    } catch (error) {
      options?.onError?.(error);

      return dispatch(
        authSlice.actions.setError({ fetchAuthenticatedUser: 'The user is unauthorized.' }),
      );
    }
  };

export const logout = (options?: IActionCreatorOptions) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.setError({ logout: null }));

  try {
    const response = await axios.post(`auth/logout`, {});

    if (response.status === HttpStatusCode.Created) {
      options?.onSuccess?.(response.data);
      return dispatch(authSlice.actions.unsetAuthenticatedUser());
    }
  } catch (error) {
    options?.onError?.(error);
    return dispatch(authSlice.actions.setError({ logout: 'The user is unauthorized.' }));
  }
};

export const selectAuthenticatedUser = (state: RootState): IUser | null => state.auth.user;
export const selectErrors = (state: RootState): IAuthSliceStateErrors => state.auth.errors;

export const { setAuthenticatedUser, unsetAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;
