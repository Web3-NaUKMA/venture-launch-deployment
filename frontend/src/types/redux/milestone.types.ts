import { IMilestone } from '../milestone.types';

export interface IMilestoneSliceStateError {
  [key: string]: string | null;
}

export interface IMilestoneSliceStateErrors {
  fetchAllMilestones: string | null;
  fetchMilestone: string | null;
  createMilestone: string | null;
  updateMilestone: string | null;
  removeMilestone: string | null;
}

export interface IMilestoneSliceState {
  milestones: IMilestone[];
  milestone: IMilestone | null;
  errors: IMilestoneSliceStateErrors;
}
