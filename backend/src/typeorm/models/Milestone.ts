import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Milestone as MilestoneInterface } from '../../types/milestone.interface';
import { Project } from './Project';

@Entity()
export class Milestone implements MilestoneInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 511 })
  mergedPullRequestUrl: string;

  @Column({ type: 'varchar', length: 511, default: null })
  transactionApprovalHash: string | null;

  @Column({ type: 'boolean', default: false })
  isFinal: boolean;

  @Column({ type: 'boolean', default: false })
  isWithdrawn: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Project, project => project.milestones, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  project: Project;
}
