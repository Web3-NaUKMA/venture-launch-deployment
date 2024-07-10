import { ProjectLaunch } from '../project-launch.types';

export interface DashboardSliceStateError {
  [key: string]: string | null;
}

export interface DashboardSliceStateErrors {
  fetchAllProjectLaunches: string | null;
  fetchLockedProjectLaunches: string | null;
  fetchInvestedProjectLaunches: string | null;
}

export interface DashboardSliceState {
  projectLaunches: ProjectLaunch[];
  lockedProjectLaunches: ProjectLaunch[];
  investedProjectLaunches: ProjectLaunch[];
  errors: DashboardSliceStateErrors;
}
