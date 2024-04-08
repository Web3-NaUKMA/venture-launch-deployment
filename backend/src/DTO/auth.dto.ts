import { UserRoleEnum } from '../types/enums/user-role.enum';

export interface IAccountRegistrationData {
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
}
