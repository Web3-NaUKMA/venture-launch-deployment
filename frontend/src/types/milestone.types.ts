export interface Milestone {
  id: string;
  mergedPullRequestUrl: string;
  description: string;
  isFinal: boolean;
  isWithdrawn: boolean;
  transactionApprovalHash: string;
  createdAt: Date;
  projectId: string;
}

export interface CreateMilestoneDto {
  mergedPullRequestUrl: string;
  description: string;
  transactionApprovalHash: string;
  projectId: string;
}

export interface UpdateMilestoneDto {
  isFinal?: boolean;
  isWithdrawn?: boolean;
  description?: string;
  transactionApprovalHash?: string;
}
