import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IUserToProject } from '../../types/user-to-project.interface';
import { Project } from './Project';
import { User } from './User';
// import { UserRoleEnum } from "../../types/enums/user-role.enum";

@Entity()
export class UserToProject implements IUserToProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: string;

  @Column()
  userId: string;

  @ManyToOne(() => Project, project => project.userToProjects, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => User, user => user.userToProjects, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  // Could be implemented later
  // @Column('enum', { enum: UserRoleEnum, default: UserRoleEnum.Participant })
  // role: UserRoleEnum;
}
