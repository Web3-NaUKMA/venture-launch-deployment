import { useAppDispatch, useAppSelector } from './redux.hooks';
import {
  fetchAuthenticatedUser,
  login,
  logout,
  register,
  selectAuthenticatedUser,
} from '../redux/slices/auth.slice';
import { IActionCreatorOptions } from '../types/redux/store.types';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { IAccountRegistrationData } from '../types/app.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authenticatedUser = useAppSelector(selectAuthenticatedUser);

  const fetchLatestAuthInfo = (options?: IActionCreatorOptions) => {
    dispatch(fetchAuthenticatedUser(options));
  };

  const signIn = (wallet: WalletContextState, options?: IActionCreatorOptions) => {
    dispatch(login(wallet, options));
  };

  const signUp = (
    wallet: WalletContextState,
    payload: IAccountRegistrationData,
    options?: IActionCreatorOptions,
  ) => {
    dispatch(register(wallet, payload, options));
  };

  const signOut = (options?: IActionCreatorOptions) => {
    dispatch(logout(options));
  };

  return { authenticatedUser, signIn, signUp, signOut, fetchLatestAuthInfo };
};
