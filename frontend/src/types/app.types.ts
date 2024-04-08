import { UserRoleEnum } from './enums/user-role.enum';

export interface IAccountRegistrationData {
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
}

export interface IRequestQueryParams {
  [key: string]: string | number | boolean | (string | number | boolean)[];
}
