import { IProjectLaunch } from '../project-launch.types';

export interface IProjectLaunchSliceStateError {
  [key: string]: string | null;
}

export interface IProjectLaunchSliceStateErrors {
  fetchAllProjectLaunches: string | null;
  fetchProjectLaunch: string | null;
  createProjectLaunch: string | null;
  updateProjectLaunch: string | null;
  removeProjectLaunch: string | null;
  createProjectLaunchInvestment: string | null;
  updateProjectLaunchInvestment: string | null;
}

export interface IProjectLaunchSliceState {
  projectLaunches: IProjectLaunch[];
  projectLaunch: IProjectLaunch | null;
  errors: IProjectLaunchSliceStateErrors;
}
