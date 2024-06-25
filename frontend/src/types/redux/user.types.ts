import { User } from '../user.types';

export interface UserSliceStateError {
  [key: string]: string | null;
}

export interface UserSliceStateErrors {
  fetchAllUsers: string | null;
  fetchUser: string | null;
  createUser: string | null;
  updateUser: string | null;
  removeUser: string | null;
}

export interface UserSliceState {
  users: User[];
  user: User | null;
  errors: UserSliceStateErrors;
}
