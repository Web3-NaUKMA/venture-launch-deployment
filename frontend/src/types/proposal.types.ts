import { CommandType } from 'utils/dao.utils';
import { Project } from './project.types';
import { User } from './user.types';
import { ProposalVote, ProposalVoteDto } from './proposal-vote.types';

export interface Proposal {
  id: string;
  type: CommandType;
  description: string;
  proposalLink: string | null;
  createdAt: Date;
  executedAt: Date | null;
  updatedAt: Date | null;
  project: Project;
  author: User;
  votes: ProposalVote[];
}

export interface CreateProposalDto {
  type: CommandType;
  description: string;
  proposalLink?: string | null;
  project: { id: string };
  author: { id: string };
}

export interface UpdateProposalDto {
  proposalLink?: string | null;
  executedAt?: string | null;
  updatedAt?: string | null;
  votesToAdd?: ProposalVoteDto[];
}
