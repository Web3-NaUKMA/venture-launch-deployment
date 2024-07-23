import { Dao } from './dao.types';
import { ProjectLaunchInvestment } from './project-launch-investment.types';
import { Project } from './project.types';
import { User } from './user.types';

export interface ProjectLaunch {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  isFundraised: boolean;
  approver: User | null;
  fundraiseAmount: number;
  fundraiseProgress: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: any;
  businessModel: string;
  tokenomics: string;
  roundDetails: any;
  project: Project | null;
  authorId?: string;
  author: User;
  projectLaunchInvestments?: ProjectLaunchInvestment[];
  createdAt: Date;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
  businessAnalystReview: string | null;
  dao: Dao;
}

export interface CreateProjectLaunchDto {
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

export interface UpdateProjectLaunchDto {
  name?: string;
  description?: string;
  isFundraised?: boolean;
  approverId?: string;
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
