import { DataAccount } from './data-account.types';
import { Milestone } from './milestone.types';
import { ProjectLaunch } from './project-launch.types';

export interface Project {
  id: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  isFinal: boolean;
  createdAt: Date;
  projectLaunch: ProjectLaunch;
  users: string[];
  milestones: Milestone[];
  dataAccount: DataAccount | null;
}

export interface CreateProjectDto {
  projectLaunchId: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  users?: string[];
}

export interface UpdateProjectDto {
  projectLaunchName?: string;
  projectLaunchDescription?: string;
  projectLaunchRaisedFunds?: number;
  milestoneNumber?: number;
  users?: string[];
  isFinal?: boolean;
  dataAccountHash?: string;
}
