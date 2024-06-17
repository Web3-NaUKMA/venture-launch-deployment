export interface Milestone {
  id: string;
  mergedPullRequestUrl: string;
  isFinal: boolean;
  isWithdrawn: boolean;
  transactionApprovalHash: string;
  createdAt: Date;
  projectId: string;
}

export interface CreateMilestoneDto {
  mergedPullRequestUrl: string;
  transactionApprovalHash: string;
  projectId: string;
}

export interface UpdateMilestoneDto {
  isFinal?: boolean;
  isWithdrawn?: boolean;
  transactionApprovalHash?: string;
}
