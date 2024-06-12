import { IProjectLaunchInvestment } from './project-launch-investment.interface';
import { IProject } from './project.interface';
import { IUser } from './user.interface';

export interface IProjectLaunch {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  isFundraised: boolean;
  fundraiseAmount: number;
  fundraiseProgress: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: JSON;
  businessModel: string;
  tokenomics: string;
  roundDetails: JSON;
  project: IProject | null;
  author: IUser;
  approver: IUser;
  projectLaunchInvestments?: IProjectLaunchInvestment[];
  createdAt: Date;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
  businessAnalystReview: string | null;
}
