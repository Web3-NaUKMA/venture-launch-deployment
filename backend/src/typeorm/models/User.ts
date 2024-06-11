import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IUser } from '../../types/user.interface';
import { Session } from './Session';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import { Project } from './Project';
import { UserToProject } from './UsersToProjects';
import { ProjectLaunchInvestment } from './ProjectLaunchInvestment';
import { IProjectLaunchInvestment } from '../../types/project-launch-investment.interface';
import { ProjectLaunch } from './ProjectLaunch';

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  walletId: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRoleEnum, array: true, default: [UserRoleEnum.Startup] })
  role: UserRoleEnum[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', default: null })
  password: string | null;

  @Column({ type: 'text', default: null })
  avatar: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  street?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @OneToOne(() => Session, session => session.user, { nullable: true })
  session: Session;

  @OneToMany(() => ProjectLaunch, projectLaunch => projectLaunch.author)
  projectLaunches: ProjectLaunch[];

  @OneToMany(() => UserToProject, userToProject => userToProject.user)
  userToProjects: UserToProject[];

  @OneToMany(
    () => ProjectLaunchInvestment,
    projectLaunchInvestment => projectLaunchInvestment.investor,
  )
  projectLaunchInvestments?: IProjectLaunchInvestment[] | undefined;
}
