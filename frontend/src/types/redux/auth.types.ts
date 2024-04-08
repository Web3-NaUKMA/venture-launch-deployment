import { IUser } from '../user.types';

export interface IAuthSliceStateError {
  [key: string]: string | null;
}

export interface IAuthSliceStateErrors {
  login: string | null;
  fetchAuthenticatedUser: string | null;
  logout: string | null;
  register: string | null;
}

export interface IAuthSliceState {
  user: IUser | null;
  errors: IAuthSliceStateErrors;
}
