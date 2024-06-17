import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectLaunchInvestment as ProjectLaunchInvestmentInterface } from '../../types/project-launch-investment.interface';
import { ProjectLaunch as ProjectLaunchInterface } from '../../types/project-launch.interface';
import { User as UserInterface } from '../../types/user.interface';
import { User } from './User';
import { ProjectLaunch } from './ProjectLaunch';

@Entity()
export class ProjectLaunchInvestment implements ProjectLaunchInvestmentInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.projectLaunchInvestments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  investor: UserInterface;

  @ManyToOne(() => ProjectLaunch, projectLaunch => projectLaunch.projectLaunchInvestments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  projectLaunch: ProjectLaunchInterface;

  @Column({ type: 'int8', default: 0 })
  amount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
