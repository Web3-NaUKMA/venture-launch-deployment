import { IProjectLaunch } from './project-launch.interface';
import { IUser } from './user.interface';

export interface IProjectLaunchInvestment {
  id: string;
  investor: IUser;
  projectLaunch: IProjectLaunch;
  amount: number;
  createdAt: Date;
}
