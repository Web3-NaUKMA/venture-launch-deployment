import { IUserToProject } from '../types/user-to-project.interface';
import { IFindProjectLaunchDto } from './project-launch.dto';

export interface ICreateProjectDto {
  projectLaunchId: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  users?: string[];
}

export interface IUpdateProjectDto {
  projectLaunchName?: string;
  projectLaunchDescription?: string;
  projectLaunchRaisedFunds?: number;
  milestoneNumber?: number;
  isFinal?: boolean;
  users?: string[];
  dataAccountHash?: string;
}

export interface IFindProjectDto {
  id?: string;
  milestoneNumber?: number;
  projectLaunchName?: string;
  projectLaunchDescription?: string;
  projectLaunchRaisedFunds?: number;
  isFinal?: boolean;
  createdAt?: Date;
  userToProjects?: Partial<IUserToProject>;
  projectLaunch?: Partial<IFindProjectLaunchDto>;
}
