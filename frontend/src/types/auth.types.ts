import { WalletContextState } from '@solana/wallet-adapter-react';
import { UserRoleEnum } from './enums/user-role.enum';

export interface AccountRegistrationData {
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
  password?: string | null;
  firstName?: string;
  lastName?: string | null;
}

export interface SignInPayload {
  wallet?: WalletContextState;
  email?: string;
  password?: string;
  googleAccessToken?: string;
}

export enum SignInMethod {
  Credentials = 'Credentials',
  Google = 'Google',
  Wallet = 'Wallet',
}
