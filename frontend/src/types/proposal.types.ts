import { CommandType } from 'utils/dao.utils';
import { User } from './user.types';
import { ProposalVote, ProposalVoteDto } from './proposal-vote.types';
import { ProposalStatusEnum } from './enums/proposal-status.enum';
import { Milestone } from './milestone.types';

export interface Proposal {
  id: string;
  type: CommandType;
  description: string;
  status: ProposalStatusEnum;
  proposalLink: string | null;
  createdAt: Date;
  executedAt: Date | null;
  updatedAt: Date | null;
  milestone: Milestone;
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
  status?: ProposalStatusEnum;
  proposalLink?: string | null;
  executedAt?: string | null;
  updatedAt?: string | null;
  votesToAdd?: ProposalVoteDto[];
}
