import { IProject } from '../project.types';

export interface IProjectSliceStateError {
  [key: string]: string | null;
}

export interface IProjectSliceStateErrors {
  fetchAllProjects: string | null;
  fetchProject: string | null;
  createProject: string | null;
  updateProject: string | null;
  removeProject: string | null;
}

export interface IProjectSliceState {
  projects: IProject[];
  project: IProject | null;
  errors: IProjectSliceStateErrors;
}
