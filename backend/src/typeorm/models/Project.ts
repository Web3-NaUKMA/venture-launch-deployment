import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IProject } from '../../types/project.interface';
import { Milestone } from './Milestone';
import { DataAccount } from './DataAccount';
import { UserToProject } from './UsersToProjects';
import { IProjectLaunch } from '../../types/project-launch.interface';
import { ProjectLaunch } from './ProjectLaunch';

@Entity()
@Index(['projectLaunchName', 'projectLaunch.id'], { unique: true })
export class Project implements IProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  projectLaunchName: string;

  @Column({ type: 'boolean', default: false })
  isFinal: boolean;

  @Column({ type: 'text' })
  projectLaunchDescription: string;

  @Column({ type: 'int8' })
  projectLaunchRaisedFunds: number;

  @Column({ type: 'int' })
  milestoneNumber: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Milestone, milestone => milestone.project)
  milestones: Milestone[];

  @OneToOne(() => DataAccount, dataAccount => dataAccount.project)
  dataAccount: DataAccount;

  @OneToMany(() => UserToProject, userToProject => userToProject.project, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userToProjects: UserToProject[];

  @OneToOne(() => ProjectLaunch, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'projectLaunchId', referencedColumnName: 'id' })
  projectLaunch: IProjectLaunch;
}
