import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import {
  ProjectSliceState,
  ProjectSliceStateError,
  ProjectSliceStateErrors,
} from '../../types/redux/project.types';
import axios from 'axios';
import { CreateProjectDto, UpdateProjectDto, Project } from '../../types/project.types';
import qs from 'qs';

const initialState: ProjectSliceState = {
  projects: [],
  project: null,
  errors: {
    fetchAllProjects: null,
    fetchProject: null,
    createProject: null,
    updateProject: null,
    removeProject: null,
    handleProposal: null,
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (
      state: ProjectSliceState,
      action: PayloadAction<Project[]>,
    ): ProjectSliceState => {
      return { ...state, projects: action.payload };
    },
    setProject: (
      state: ProjectSliceState,
      action: PayloadAction<Project | null>,
    ): ProjectSliceState => {
      return { ...state, project: action.payload };
    },
    addProject: (state: ProjectSliceState, action: PayloadAction<Project>): ProjectSliceState => {
      return { ...state, projects: [action.payload, ...state.projects] };
    },
    editProject: (state: ProjectSliceState, action: PayloadAction<Project>): ProjectSliceState => {
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project,
        ),
      };
    },
    deleteProject: (state: ProjectSliceState, action: PayloadAction<string>): ProjectSliceState => {
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
      };
    },
    setError: (
      state: ProjectSliceState,
      action: PayloadAction<ProjectSliceStateError>,
    ): ProjectSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllProjects =
  (queryParams?: any, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectSlice.actions.setError({ fetchAllProjects: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);
      const response = await axios.get(`projects/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectSlice.actions.setProjects(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectSlice.actions.setError({ fetchAllProjects: 'Cannot fetch the list of projects.' }),
      );
    }
  };

export const fetchProject =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectSlice.actions.setError({ fetchProject: null }));

    try {
      const response = await axios.get(`projects/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectSlice.actions.setProject(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectSlice.actions.setError({
          fetchProject: 'Cannot fetch the project with specified id.',
        }),
      );
    }
  };

export const createProject =
  (project: CreateProjectDto, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectSlice.actions.setError({ createProject: null }));

    try {
      const response = await axios.post(`projects`, project);

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(projectSlice.actions.addProject(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectSlice.actions.setError({
          createProject: 'Cannot create the project with provided data.',
        }),
      );
    }
  };

export const updateProject =
  (id: string, project: UpdateProjectDto, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(projectSlice.actions.setError({ updateProject: null }));

    try {
      const response = await axios.put(`projects/${id}`, project);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectSlice.actions.editProject(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectSlice.actions.setError({
          updateProject: 'Cannot update the project with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const removeProject =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectSlice.actions.setError({ removeProject: null }));

    try {
      const response = await axios.delete(`projects/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectSlice.actions.deleteProject(response.data.id));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectSlice.actions.setError({
          removeProject: 'Cannot remove the project with specified id.',
        }),
      );
    }
  };

export const selectProjects = (state: RootState): Project[] => state.project.projects;
export const selectProject = (state: RootState): Project | null => state.project.project;
export const selectErrors = (state: RootState): ProjectSliceStateErrors => state.project.errors;

export const { setError, setProject, setProjects, addProject, editProject, deleteProject } =
  projectSlice.actions;
export default projectSlice.reducer;
