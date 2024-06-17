import { ProjectLaunch } from './project-launch.types';
import { User } from './user.types';

export interface ProjectLaunchInvestment {
  id: string;
  investor: User;
  projectLaunch: ProjectLaunch;
  amount: number;
  createdAt: Date;
}

export interface CreateProjectLaunchInvestmentDto {
  amount?: number;
  investorId: string;
  projectLaunchId: string;
}

export interface UpdateProjectLaunchInvestmentDto {
  amount?: number;
  isInvestorApproved?: boolean;
}
