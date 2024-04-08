import { IProjectLaunch } from '../types/project-launch.interface';
import { IUser } from '../types/user.interface';

export interface ICreateProjectLaunchInvestmentDto {
  investorId: string;
  projectLaunchId: string;
}

export interface IUpdateProjectLaunchInvestmentDto {
  amount?: number;
}

export interface IFindProjectLaunchInvestmentDto {
  id?: string;
  investor?: Partial<IUser>;
  projectLaunch?: Partial<IProjectLaunch>;
  amount?: number;
  createdAt?: Date;
}
