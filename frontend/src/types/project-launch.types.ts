import { IProjectLaunchInvestment } from './project-launch-investment.types';
import { IProject } from './project.types';
import { IUser } from './user.types';

export interface IProjectLaunch {
  id: string;
  name: string;
  description: string;
  isFundraised: boolean;
  isApproved: boolean;
  fundraiseAmount: number;
  fundraiseProgress: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: any;
  businessModel: string;
  tokenomics: string;
  roundDetails: any;
  project: IProject | null;
  authorId?: string;
  author: IUser;
  projectLaunchInvestments?: IProjectLaunchInvestment[];
  createdAt: Date;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
}

export interface ICreateProjectLaunch {
  name: string;
  description: string;
  fundraiseAmount: number;
  fundraiseDeadline: Date;
  team: JSON;
  businessModel: string;
  tokenomics: string;
  roundDetails: JSON;
  authorId: string;
  milestonesNumber: number;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
}

export interface IUpdateProjectLaunch {
  name?: string;
  description?: string;
  isFundraised?: boolean;
  isApproved?: boolean;
  fundraiseAmount?: number;
  fundraiseProgress?: number;
  fundraiseDeadline?: Date;
  projectDocuments?: string[];
  team?: JSON;
  businessModel?: string;
  tokenomics?: string;
  roundDetails?: JSON;
  vaultTokenAccount?: string;
  cryptoTrackerAccount?: string;
}
