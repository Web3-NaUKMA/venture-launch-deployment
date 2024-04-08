import { IProjectLaunch } from './project-launch.interface';

export interface IProject {
  id: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  isFinal: boolean;
  createdAt: Date;
  projectLaunch: IProjectLaunch;
}
