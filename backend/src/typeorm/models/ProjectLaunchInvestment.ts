import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IProjectLaunchInvestment } from '../../types/project-launch-investment.interface';
import { IProjectLaunch } from '../../types/project-launch.interface';
import { IUser } from '../../types/user.interface';
import { User } from './User';
import { ProjectLaunch } from './ProjectLaunch';

@Entity()
export class ProjectLaunchInvestment implements IProjectLaunchInvestment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.projectLaunchInvestments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  investor: IUser;

  @ManyToOne(() => ProjectLaunch, projectLaunch => projectLaunch.projectLaunchInvestments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  projectLaunch: IProjectLaunch;

  @Column({ type: 'int8', default: 0 })
  amount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
