import { IUser } from '../user.types';

export interface IUserSliceStateError {
  [key: string]: string | null;
}

export interface IUserSliceStateErrors {
  fetchAllUsers: string | null;
  fetchUser: string | null;
  createUser: string | null;
  updateUser: string | null;
  removeUser: string | null;
}

export interface IUserSliceState {
  users: IUser[];
  user: IUser | null;
  errors: IUserSliceStateErrors;
}
