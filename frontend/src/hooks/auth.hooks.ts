import { useAppDispatch, useAppSelector } from './redux.hooks';
import {
  fetchAuthenticatedUser,
  loginWithWallet,
  loginWithGoogle,
  loginWithCredentials,
  logout,
  register,
  selectAuthenticatedUser,
} from '../redux/slices/auth.slice';
import { ActionCreatorOptions } from '../types/redux/store.types';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { AccountRegistrationData, SignInMethod, SignInPayload } from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authenticatedUser = useAppSelector(selectAuthenticatedUser);
  const wallet = useWallet();

  const fetchLatestAuthInfo = (options?: ActionCreatorOptions) => {
    dispatch(fetchAuthenticatedUser(options));
  };

  const signIn = (
    method: SignInMethod = SignInMethod.Credentials,
    payload: SignInPayload,
    options?: ActionCreatorOptions,
  ) => {
    switch (method) {
      case SignInMethod.Wallet:
        if (payload.wallet) {
          dispatch(loginWithWallet(payload.wallet, options));
        }
        break;
      case SignInMethod.Google:
        if (payload.googleAccessToken) {
          dispatch(loginWithGoogle(payload.googleAccessToken, options));
        }
        break;
      case SignInMethod.Credentials:
        if (payload.email && payload.password) {
          dispatch(loginWithCredentials(payload.email, payload.password, options));
        }
        break;
    }
  };

  const signUp = (
    wallet: WalletContextState,
    payload: AccountRegistrationData,
    options?: ActionCreatorOptions,
  ) => {
    dispatch(register(wallet, payload, options));
  };

  const signOut = async (options?: ActionCreatorOptions) => {
    localStorage.removeItem('walletName');
    sessionStorage.removeItem('wallet');
    await wallet.disconnect();
    dispatch(logout(options));
  };

  return { authenticatedUser, signIn, signUp, signOut, fetchLatestAuthInfo };
};
