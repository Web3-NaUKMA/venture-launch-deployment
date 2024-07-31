import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import {
  ProjectLaunchSliceState,
  ProjectLaunchSliceStateError,
  ProjectLaunchSliceStateErrors,
} from '../../types/redux/project-launch.types';
import axios from 'axios';
import { ProjectLaunch } from '../../types/project-launch.types';
import { createProject, updateProject } from './project.slice';
import { CreateProjectDto } from '../../types/project.types';
import {
  CreateProjectLaunchInvestmentDto,
  ProjectLaunchInvestment,
  UpdateProjectLaunchInvestmentDto,
} from '../../types/project-launch-investment.types';
import qs from 'qs';

const initialState: ProjectLaunchSliceState = {
  projectLaunches: [],
  projectLaunch: null,
  errors: {
    fetchAllProjectLaunches: null,
    fetchProjectLaunch: null,
    createProjectLaunch: null,
    updateProjectLaunch: null,
    removeProjectLaunch: null,
    createProjectLaunchInvestment: null,
    updateProjectLaunchInvestment: null,
  },
};

const projectLaunchSlice = createSlice({
  name: 'project-launch',
  initialState,
  reducers: {
    setProjectLaunches: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<ProjectLaunch[]>,
    ): ProjectLaunchSliceState => {
      return { ...state, projectLaunches: action.payload };
    },
    setProjectLaunch: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<ProjectLaunch | null>,
    ): ProjectLaunchSliceState => {
      return { ...state, projectLaunch: action.payload };
    },
    addProjectLaunch: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<ProjectLaunch>,
    ): ProjectLaunchSliceState => {
      return { ...state, projectLaunches: [action.payload, ...state.projectLaunches] };
    },
    editProjectLaunch: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<ProjectLaunch>,
    ): ProjectLaunchSliceState => {
      return {
        ...state,
        projectLaunches: state.projectLaunches.map(projectLaunch =>
          projectLaunch.id === action.payload.id ? action.payload : projectLaunch,
        ),
      };
    },
    deleteProjectLaunch: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<string>,
    ): ProjectLaunchSliceState => {
      return {
        ...state,
        projectLaunches: state.projectLaunches.filter(
          projectLaunch => projectLaunch.id !== action.payload,
        ),
      };
    },
    addProjectLaunchInvestment: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<{ id: string; data: ProjectLaunchInvestment }>,
    ): ProjectLaunchSliceState => {
      return {
        ...state,
        projectLaunches: state.projectLaunches.map(projectLaunch =>
          projectLaunch.id === action.payload.id
            ? {
                ...projectLaunch,
                projectLaunchInvestments: [
                  ...(projectLaunch.projectLaunchInvestments ?? []),
                  action.payload.data,
                ],
              }
            : projectLaunch,
        ),
      };
    },
    editProjectLaunchInvestment: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<{ id: string; data: ProjectLaunchInvestment }>,
    ): ProjectLaunchSliceState => {
      return {
        ...state,
        projectLaunches: state.projectLaunches.map(projectLaunch =>
          projectLaunch.id === action.payload.id
            ? {
                ...projectLaunch,
                projectLaunchInvestments: projectLaunch.projectLaunchInvestments?.map(investment =>
                  investment.id === action.payload.data.id ? action.payload.data : investment,
                ),
              }
            : projectLaunch,
        ),
      };
    },
    setError: (
      state: ProjectLaunchSliceState,
      action: PayloadAction<ProjectLaunchSliceStateError>,
    ): ProjectLaunchSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllProjectLaunches =
  (queryParams?: any, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ fetchAllProjectLaunches: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);

      const response = await axios.get(`project-launches/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectLaunchSlice.actions.setProjectLaunches(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          fetchAllProjectLaunches: 'Cannot fetch the list of project launches.',
        }),
      );
    }
  };

export const fetchProjectLaunch =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ fetchProjectLaunch: null }));

    try {
      const response = await axios.get(`project-launches/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectLaunchSlice.actions.setProjectLaunch(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          fetchProjectLaunch: 'Cannot fetch the project launch with specified id.',
        }),
      );
    }
  };

export const createProjectLaunch =
  (formData: FormData, options?: ActionCreatorOptions, addToReduxState: boolean = true) =>
  async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ createProjectLaunch: null }));

    try {
      const milestoneNumber = Number(formData.get('milestoneNumber')?.toString() ?? 0);
      formData.delete('milestoneNumber');

      const response = await axios.post(`project-launches`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);

        const project: CreateProjectDto = {
          projectLaunchId: response.data.id,
          projectLaunchName: formData.get('name')?.toString() ?? '',
          projectLaunchDescription: formData.get('description')?.toString() ?? '',
          projectLaunchRaisedFunds: 0,
          milestoneNumber,
        };

        dispatch(createProject(project));
        if (addToReduxState) {
          return dispatch(projectLaunchSlice.actions.addProjectLaunch(response.data));
        }
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          createProject: 'Cannot create the project launch with provided data.',
        }),
      );
    }
  };

export const updateProjectLaunch =
  (id: string, formData: FormData, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ updateProjectLaunch: null }));

    try {
      const milestoneNumber = Number(formData.get('milestoneNumber')?.toString() || 0);
      const relatedProjectId = formData.get('relatedProjectId')?.toString() || '';
      formData.delete('milestoneNumber');
      formData.delete('relatedProjectId');

      const response = await axios.put(`project-launches/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);

        if (relatedProjectId) {
          dispatch(updateProject(relatedProjectId, { milestoneNumber }));
        }

        return dispatch(projectLaunchSlice.actions.editProjectLaunch(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          updateProjectLaunch:
            'Cannot update the project launch with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const removeProjectLaunch =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ removeProjectLaunch: null }));

    try {
      const response = await axios.delete(`project-launches/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(projectLaunchSlice.actions.deleteProjectLaunch(response.data.id));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          removeProjectLaunch: 'Cannot remove the project launch with specified id.',
        }),
      );
    }
  };

export const createProjectLaunchInvestment =
  (investment: CreateProjectLaunchInvestmentDto, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ createProjectLaunchInvestment: null }));

    try {
      const response = await axios.post(
        `project-launches/${investment.projectLaunchId}/investors`,
        investment,
        {},
      );

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(
          projectLaunchSlice.actions.addProjectLaunchInvestment({
            id: investment.projectLaunchId,
            data: response.data,
          }),
        );
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          createProjectInvestment:
            'Cannot create the project launch investment with provided data.',
        }),
      );
    }
  };

export const updateProjectLaunchInvestment =
  (
    id: string,
    investorId: string,
    investment: UpdateProjectLaunchInvestmentDto,
    options?: ActionCreatorOptions,
  ) =>
  async (dispatch: AppDispatch) => {
    dispatch(projectLaunchSlice.actions.setError({ updateProjectLaunchInvestment: null }));

    try {
      const response = await axios.put(
        `project-launches/${id}/investors/${investorId}`,
        investment,
      );

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(
          projectLaunchSlice.actions.editProjectLaunchInvestment({ id, data: response.data }),
        );
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        projectLaunchSlice.actions.setError({
          updateProjectLaunchInvestment:
            'Cannot update the project launch investment with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const selectProjectLaunches = (state: RootState): ProjectLaunch[] =>
  state.projectLaunch.projectLaunches;
export const selectProjectLaunch = (state: RootState): ProjectLaunch | null =>
  state.projectLaunch.projectLaunch;
export const selectErrors = (state: RootState): ProjectLaunchSliceStateErrors =>
  state.projectLaunch.errors;

export const {
  setError,
  setProjectLaunch,
  setProjectLaunches,
  addProjectLaunch,
  editProjectLaunch,
  deleteProjectLaunch,
} = projectLaunchSlice.actions;
export default projectLaunchSlice.reducer;
