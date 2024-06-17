import { ProjectLaunch } from '../project-launch.types';

export interface ProjectLaunchSliceStateError {
  [key: string]: string | null;
}

export interface ProjectLaunchSliceStateErrors {
  fetchAllProjectLaunches: string | null;
  fetchProjectLaunch: string | null;
  createProjectLaunch: string | null;
  updateProjectLaunch: string | null;
  removeProjectLaunch: string | null;
  createProjectLaunchInvestment: string | null;
  updateProjectLaunchInvestment: string | null;
}

export interface ProjectLaunchSliceState {
  projectLaunches: ProjectLaunch[];
  projectLaunch: ProjectLaunch | null;
  errors: ProjectLaunchSliceStateErrors;
}
