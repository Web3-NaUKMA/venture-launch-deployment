import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Proposal } from '../../types/proposal.interface';
import { Project } from '../../types/project.interface';
import { ProposalVote } from '../../types/proposal-vote.interface';
import { User } from '../../types/user.interface';
import { CommandType } from '../../utils/dao.utils';
import { ProjectEntity } from './project.entity';
import { UserEntity } from './user.entity';
import { ProposalVoteEntity } from './proposal-vote.entity';

@Entity('proposal')
export class ProposalEntity implements Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: CommandType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 256, nullable: true, default: null })
  proposalLink: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  executedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @ManyToOne(() => ProjectEntity, project => project.proposals, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => UserEntity, user => user.proposals, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  author: User;

  @OneToMany(() => ProposalVoteEntity, proposalVote => proposalVote.proposal)
  votes: ProposalVote[];
}
