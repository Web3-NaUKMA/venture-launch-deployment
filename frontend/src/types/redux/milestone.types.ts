import { Milestone } from '../milestone.types';

export interface MilestoneSliceStateError {
  [key: string]: string | null;
}

export interface MilestoneSliceStateErrors {
  fetchAllMilestones: string | null;
  fetchMilestone: string | null;
  createMilestone: string | null;
  updateMilestone: string | null;
  removeMilestone: string | null;
}

export interface MilestoneSliceState {
  milestones: Milestone[];
  milestone: Milestone | null;
  errors: MilestoneSliceStateErrors;
}
