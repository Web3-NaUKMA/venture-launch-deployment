import { IProjectLaunch } from './project-launch.types';
import { IUser } from './user.types';

export interface IProjectLaunchInvestment {
  id: string;
  investor: IUser;
  projectLaunch: IProjectLaunch;
  amount: number;
  createdAt: Date;
}

export interface ICreateProjectLaunchInvestment {
  amount?: number;
  investorId: string;
  projectLaunchId: string;
}

export interface IUpdateProjectLaunchInvestment {
  amount?: number;
  isInvestorApproved?: boolean;
}
