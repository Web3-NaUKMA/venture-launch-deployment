import { Project } from '../project.types';

export interface ProjectSliceStateError {
  [key: string]: string | null;
}

export interface ProjectSliceStateErrors {
  fetchAllProjects: string | null;
  fetchProject: string | null;
  createProject: string | null;
  updateProject: string | null;
  removeProject: string | null;
  handleProposal: string | null;
}

export interface ProjectSliceState {
  projects: Project[];
  project: Project | null;
  errors: ProjectSliceStateErrors;
}
