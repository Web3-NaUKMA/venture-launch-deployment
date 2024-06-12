import { UserRoleEnum } from './enums/user-role.enum';

export interface IUser {
  id: string;
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
  avatar?: string | null;
  bio?: string | null;
  createdAt?: Date;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zipCode?: string;
  phone?: string;
}

export interface ICreateUser {
  walletId: string;
  username: string;
  password?: string | null;
  email: string;
  role: UserRoleEnum[];
}

export interface IUpdateUser {
  username?: string;
  email?: string;
  role?: UserRoleEnum;
  password?: string | null;
  avatar?: string | null;
  bio?: string | null;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zipCode?: string;
  phone?: string;
}
