import { User } from '../user.types';

export interface AuthSliceStateError {
  [key: string]: string | null;
}

export interface AuthSliceStateErrors {
  login: string | null;
  fetchAuthenticatedUser: string | null;
  logout: string | null;
  register: string | null;
}

export interface AuthSliceState {
  user: User | null;
  errors: AuthSliceStateErrors;
}
