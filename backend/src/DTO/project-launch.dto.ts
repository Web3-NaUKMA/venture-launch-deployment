import { IUser } from '../types/user.interface';
import { IFindProjectLaunchInvestmentDto } from './project-launch-investment.dto';
import { IFindProjectDto } from './project.dto';

export interface ICreateProjectLaunchDto {
  name: string;
  description: string;
  logo: string | null;
  fundraiseAmount: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: JSON;
  businessModel: string;
  tokenomics: string;
  roundDetails: JSON;
  authorId: string;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
}

export interface IUpdateProjectLaunchDto {
  name?: string;
  description?: string;
  logo?: string | null;
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
  businessAnalystReview?: string | null;
}

export interface IFindProjectLaunchDto {
  id?: string;
  name?: string;
  description?: string;
  isFundraised?: boolean;
  isApproved?: boolean;
  fundraiseAmount?: number;
  fundraiseProgress?: number;
  fundraiseDeadline?: Date;
  projectDocuments?: string[];
  projectLaunchInvestments?: Partial<IFindProjectLaunchInvestmentDto>;
  team?: JSON;
  businessModel?: string;
  tokenomics?: string;
  roundDetails?: JSON;
  author?: Partial<IUser>;
  project?: Partial<IFindProjectDto>;
  createdAt?: Date;
  vaultTokenAccount?: string;
  cryptoTrackerAccount?: string;
}
