import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import axios from 'axios';
import { ProjectLaunch } from '../../types/project-launch.types';
import qs from 'qs';
import {
  DashboardSliceState,
  DashboardSliceStateError,
  DashboardSliceStateErrors,
} from 'types/redux/dashboard.slice';

const initialState: DashboardSliceState = {
  projectLaunches: [],
  lockedProjectLaunches: [],
  investedProjectLaunches: [],
  errors: {
    fetchAllProjectLaunches: null,
    fetchInvestedProjectLaunches: null,
    fetchLockedProjectLaunches: null,
  },
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setProjectLaunches: (
      state: DashboardSliceState,
      action: PayloadAction<ProjectLaunch[]>,
    ): DashboardSliceState => {
      return { ...state, projectLaunches: action.payload };
    },
    setLockedProjectLaunches: (
      state: DashboardSliceState,
      action: PayloadAction<ProjectLaunch[]>,
    ): DashboardSliceState => {
      return { ...state, lockedProjectLaunches: action.payload };
    },
    setInvestedProjectLaunches: (
      state: DashboardSliceState,
      action: PayloadAction<ProjectLaunch[]>,
    ): DashboardSliceState => {
      return { ...state, investedProjectLaunches: action.payload };
    },
    setError: (
      state: DashboardSliceState,
      action: PayloadAction<DashboardSliceStateError>,
    ): DashboardSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllProjectLaunches =
  (queryParams?: any, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(dashboardSlice.actions.setError({ fetchAllProjectLaunches: null }));

    try {
      const query = qs.stringify(queryParams, {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any);

      const response = await axios.get(`project-launches/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(dashboardSlice.actions.setProjectLaunches(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        dashboardSlice.actions.setError({
          fetchAllProjectLaunches: 'Cannot fetch the list of project launches.',
        }),
      );
    }
  };

export const fetchLockedProjectLaunches =
  (options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(dashboardSlice.actions.setError({ fetchLockedProjectLaunches: null }));

    const query = qs.stringify(
      {
        where: {
          isFundraised: false,
          approver: {
            id: {
              not: null,
            },
          },
        },
        relations: {
          projectLaunchInvestments: {
            investor: true,
          },
        },
      },
      {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any,
    );
    try {
      const response = await axios.get(`project-launches/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(dashboardSlice.actions.setLockedProjectLaunches(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        dashboardSlice.actions.setError({
          fetchLockedProjectLaunches: 'Cannot fetch the list of locked project launches.',
        }),
      );
    }
  };

export const fetchInvestedProjectLaunches =
  (options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(dashboardSlice.actions.setError({ fetchInvestedProjectLaunches: null }));

    const query = qs.stringify(
      {
        relations: {
          projectLaunchInvestments: {
            investor: true,
          },
        },
      },
      {
        arrayFormat: 'comma',
        allowDots: true,
        commaRoundTrip: true,
      } as any,
    );
    try {
      const response = await axios.get(`project-launches/${query ? `?${query}` : ``}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(dashboardSlice.actions.setInvestedProjectLaunches(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        dashboardSlice.actions.setError({
          fetchInvestedProjectLaunches: 'Cannot fetch the list of invested project launches.',
        }),
      );
    }
  };

export const selectProjectLaunches = (state: RootState): ProjectLaunch[] =>
  state.dashboard.projectLaunches;
export const selectLockedProjectLaunches = (state: RootState): ProjectLaunch[] =>
  state.dashboard.lockedProjectLaunches;
export const selectInvestedProjectLaunches = (state: RootState): ProjectLaunch[] =>
  state.dashboard.investedProjectLaunches;
export const selectErrors = (state: RootState): DashboardSliceStateErrors => state.dashboard.errors;

export const { setError, setProjectLaunches } = dashboardSlice.actions;
export default dashboardSlice.reducer;
