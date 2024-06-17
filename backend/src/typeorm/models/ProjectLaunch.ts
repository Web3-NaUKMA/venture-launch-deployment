import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectLaunch as ProjectLaunchInterface } from '../../types/project-launch.interface';
import { Project as ProjectInterface } from '../../types/project.interface';
import { Project } from './Project';
import { ProjectLaunchInvestment } from './ProjectLaunchInvestment';
import { ProjectLaunchInvestment as ProjectLaunchInvestmentInterface } from '../../types/project-launch-investment.interface';
import { User as UserInterface } from '../../types/user.interface';
import { User } from './User';

@Entity()
@Index(['name', 'author.id'], { unique: true })
export class ProjectLaunch implements ProjectLaunchInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', default: null })
  logo: string | null;

  @Column({ type: 'boolean', default: false })
  isFundraised: boolean;

  @Column({ type: 'int8' })
  fundraiseAmount: number;

  @Column({ type: 'int8', default: 0 })
  fundraiseProgress: number;

  @Column({ type: 'timestamptz' })
  fundraiseDeadline: Date;

  @Column({ type: 'text', array: true, default: [] })
  projectDocuments: string[];

  @Column({ type: 'jsonb', default: '[]' })
  team: JSON;

  @Column({ type: 'text' })
  businessModel: string;

  @Column({ type: 'text' })
  tokenomics: string;

  @Column({ type: 'jsonb', default: '{}' })
  roundDetails: JSON;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'projectId', referencedColumnName: 'id' })
  project: ProjectInterface | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'text' })
  vaultTokenAccount: string;

  @Column({ type: 'text' })
  cryptoTrackerAccount: string;

  @ManyToOne(() => User, user => user.projectLaunches, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  author: UserInterface;

  @OneToMany(
    () => ProjectLaunchInvestment,
    projectLaunchInvestment => projectLaunchInvestment.projectLaunch,
  )
  projectLaunchInvestments?: ProjectLaunchInvestmentInterface[] | undefined;

  @Column({ type: 'text', default: null })
  businessAnalystReview: string | null;

  @ManyToOne(() => User, user => user.approvedProjectLaunches, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  approver: UserInterface;
}
