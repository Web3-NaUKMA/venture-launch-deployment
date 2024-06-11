import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import axios from 'axios';
import {
  IMilestoneSliceState,
  IMilestoneSliceStateError,
  IMilestoneSliceStateErrors,
} from '../../types/redux/milestone.types';
import { ICreateMilestone, IMilestone, IUpdateMilestone } from '../../types/milestone.types';

const initialState: IMilestoneSliceState = {
  milestones: [],
  milestone: null,
  errors: {
    fetchAllMilestones: null,
    fetchMilestone: null,
    createMilestone: null,
    updateMilestone: null,
    removeMilestone: null,
  },
};

const milestoneSlice = createSlice({
  name: 'milestone',
  initialState,
  reducers: {
    setMilestones: (
      state: IMilestoneSliceState,
      action: PayloadAction<IMilestone[]>,
    ): IMilestoneSliceState => {
      return { ...state, milestones: action.payload };
    },
    setMilestone: (
      state: IMilestoneSliceState,
      action: PayloadAction<IMilestone | null>,
    ): IMilestoneSliceState => {
      return { ...state, milestone: action.payload };
    },
    addMilestone: (
      state: IMilestoneSliceState,
      action: PayloadAction<IMilestone>,
    ): IMilestoneSliceState => {
      return { ...state, milestones: [action.payload, ...state.milestones] };
    },
    editMilestone: (
      state: IMilestoneSliceState,
      action: PayloadAction<IMilestone>,
    ): IMilestoneSliceState => {
      return {
        ...state,
        milestones: state.milestones.map(milestone =>
          milestone.id === action.payload.id ? action.payload : milestone,
        ),
      };
    },
    deleteMilestone: (
      state: IMilestoneSliceState,
      action: PayloadAction<string>,
    ): IMilestoneSliceState => {
      return {
        ...state,
        milestones: state.milestones.filter(milestone => milestone.id !== action.payload),
      };
    },
    setError: (
      state: IMilestoneSliceState,
      action: PayloadAction<IMilestoneSliceStateError>,
    ): IMilestoneSliceState => {
      return { ...state, errors: { ...state.errors, ...action.payload } };
    },
  },
});

export const fetchAllMilestones =
  (options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(milestoneSlice.actions.setError({ fetchAllMilestones: null }));

    try {
      const response = await axios.get(`milestones`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(milestoneSlice.actions.setMilestones(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        milestoneSlice.actions.setError({
          fetchAllMilestones: 'Cannot fetch the list of milestones.',
        }),
      );
    }
  };

export const fetchMilestone =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(milestoneSlice.actions.setError({ fetchMilestone: null }));

    try {
      const response = await axios.get(`milestones/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(milestoneSlice.actions.setMilestone(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        milestoneSlice.actions.setError({
          fetchMilestone: 'Cannot fetch the milestone with specified id.',
        }),
      );
    }
  };

export const createMilestone =
  (milestone: ICreateMilestone, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(milestoneSlice.actions.setError({ createMilestone: null }));

    try {
      const response = await axios.post(`milestones`, milestone);

      if (response.status === HttpStatusCode.Created) {
        options?.onSuccess?.(response.data);
        return dispatch(milestoneSlice.actions.addMilestone(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        milestoneSlice.actions.setError({
          createMilestone: 'Cannot create the milestone with provided data.',
        }),
      );
    }
  };

export const updateMilestone =
  (id: string, milestone: IUpdateMilestone, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(milestoneSlice.actions.setError({ updateMilestone: null }));

    try {
      const response = await axios.put(`milestones/${id}`, milestone);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(milestoneSlice.actions.editMilestone(response.data));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        milestoneSlice.actions.setError({
          updateMilestone:
            'Cannot update the milestone with specified id. Invalid data was provided.',
        }),
      );
    }
  };

export const removeMilestone =
  (id: string, options?: ActionCreatorOptions) => async (dispatch: AppDispatch) => {
    dispatch(milestoneSlice.actions.setError({ removeMilestone: null }));

    try {
      const response = await axios.delete(`milestones/${id}`);

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(milestoneSlice.actions.deleteMilestone(response.data.id));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        milestoneSlice.actions.setError({
          removeMilestone: 'Cannot remove the milestone with specified id.',
        }),
      );
    }
  };

export const selectMilestones = (state: RootState): IMilestone[] => state.milestone.milestones;
export const selectMilestone = (state: RootState): IMilestone | null => state.milestone.milestone;
export const selectErrors = (state: RootState): IMilestoneSliceStateErrors =>
  state.milestone.errors;

export const {
  setError,
  setMilestone,
  setMilestones,
  addMilestone,
  editMilestone,
  deleteMilestone,
} = milestoneSlice.actions;
export default milestoneSlice.reducer;
