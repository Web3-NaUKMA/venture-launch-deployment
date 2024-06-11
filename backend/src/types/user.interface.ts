import { UserRoleEnum } from './enums/user-role.enum';
import { IProjectLaunchInvestment } from './project-launch-investment.interface';
import { IProjectLaunch } from './project-launch.interface';

export interface IUser {
  id: string;
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
  createdAt: Date;
  password?: string | null;
  avatar?: string | null;
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
  projectLaunches: IProjectLaunch[];
  projectLaunchInvestments?: IProjectLaunchInvestment[];
}
