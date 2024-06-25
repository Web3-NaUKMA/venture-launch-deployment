import { ProjectLaunch } from './project-launch.interface';

export interface Project {
  id: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  isFinal: boolean;
  createdAt: Date;
  projectLaunch: ProjectLaunch;
}
