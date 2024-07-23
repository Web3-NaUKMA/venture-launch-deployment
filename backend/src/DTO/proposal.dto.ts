import { ProposalVote } from '../types/proposal-vote.interface';
import { CommandType } from '../utils/dao.utils';

export type ProposalVoteDto = Omit<ProposalVote, 'datetime' | 'member' | 'proposal' | 'proposalId'>;

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
