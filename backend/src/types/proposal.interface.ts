import { CommandType } from '../utils/dao.utils';
import { Project } from './project.interface';
import { ProposalVote } from './proposal-vote.interface';
import { User } from './user.interface';

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
