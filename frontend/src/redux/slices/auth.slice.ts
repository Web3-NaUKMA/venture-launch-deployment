import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  AuthSliceState,
  AuthSliceStateError,
  AuthSliceStateErrors,
} from '../../types/redux/auth.types';
import { User } from '../../types/user.types';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { AccountRegistrationData } from '../../types/auth.types';
import bs58 from 'bs58';
import axios from 'axios';

const initialState: AuthSliceState = {
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
      state: AuthSliceState,
      action: PayloadAction<User | null>,
    ): AuthSliceState => {
      return { ...state, user: action.payload };
    },
    unsetAuthenticatedUser: (state: AuthSliceState): AuthSliceState => {
      return { ...state, user: null };
    },
    setError: (
      state: AuthSliceState,
      action: PayloadAction<AuthSliceStateError>,
    ): AuthSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const loginWithWallet =
  (wallet: WalletContextState, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
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

      const response = await axios.post(`auth/login/wallet`, { publicKey, token });

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(authSlice.actions.setAuthenticatedUser(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(authSlice.actions.setError({ login: 'The user is unauthorized.' }));
    }
  };

export const loginWithGoogle =
  (googleAccessToken: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(authSlice.actions.setError({ login: null }));

    try {
      if (!googleAccessToken) {
        throw new Error('The google access token is missing. Cannot authorize the user.');
      }

      const response = await axios.post(`auth/login/google`, { googleAccessToken });

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(authSlice.actions.setAuthenticatedUser(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(authSlice.actions.setError({ login: 'The user is unauthorized.' }));
    }
  };

export const loginWithCredentials =
  (email: string, password: string, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(authSlice.actions.setError({ login: null }));

    try {
      if (!email || !password) {
        throw new Error('The email or password is missing. Cannot authorize the user.');
      }

      const response = await axios.post(`auth/login/credentials`, { email, password });

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
  (wallet: WalletContextState, data: AccountRegistrationData, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(authSlice.actions.setError({ register: null }));
    try {
      const response = await axios.post(`auth/register`, data);

      if (response.status === HttpStatusCode.Created) {
        return dispatch(loginWithWallet(wallet, options));
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
  (options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
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

export const logout = (options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
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

export const selectAuthenticatedUser = (state: RootState): User | null => state.auth.user;
export const selectErrors = (state: RootState): AuthSliceStateErrors => state.auth.errors;

export const { setAuthenticatedUser, unsetAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;
