import { IDataAccount } from './data-account.types';
import { IMilestone } from './milestone.types';
import { IProjectLaunch } from './project-launch.types';

export interface IProject {
  id: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  isFinal: boolean;
  createdAt: Date;
  projectLaunch: IProjectLaunch;
  users: string[];
  milestones: IMilestone[];
  dataAccount: IDataAccount | null;
}

export interface ICreateProject {
  projectLaunchId: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  users?: string[];
}

export interface IUpdateProject {
  projectLaunchName?: string;
  projectLaunchDescription?: string;
  projectLaunchRaisedFunds?: number;
  milestoneNumber?: number;
  users?: string[];
  isFinal?: boolean;
  dataAccountHash?: string;
}
