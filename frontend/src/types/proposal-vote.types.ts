import { ProposalVoteEnum } from './enums/proposal-vote.enum';
import { Proposal } from './proposal.types';
import { User } from './user.types';

export interface ProposalVote {
  memberId: string;
  proposalId: string;
  member: User;
  proposal: Proposal;
  decision: ProposalVoteEnum;
  datetime: Date;
}

export type ProposalVoteDto = Omit<ProposalVote, 'datetime' | 'member' | 'proposal' | 'proposalId'>;
