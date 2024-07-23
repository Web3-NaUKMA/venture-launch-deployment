import { UserRoleEnum } from './enums/user-role.enum';
import { ProjectLaunchInvestment } from './project-launch-investment.types';
import { ProjectLaunch } from './project-launch.types';
import { ProposalVote } from './proposal-vote.types';
import { Proposal } from './proposal.types';

export interface User {
  id: string;
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
  avatar?: string | null;
  bio?: string | null;
  createdAt?: Date;
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
  projectLaunches: ProjectLaunch[];
  approvedProjectLaunches: ProjectLaunch[];
  projectLaunchInvestments?: ProjectLaunchInvestment[];
  proposals: Proposal[];
  proposalVotes: ProposalVote[];
}

export interface CreateUserDto {
  walletId: string;
  username: string;
  password?: string | null;
  email: string;
  role: UserRoleEnum[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: UserRoleEnum;
  password?: string | null;
  avatar?: string | null;
  bio?: string | null;
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
}
