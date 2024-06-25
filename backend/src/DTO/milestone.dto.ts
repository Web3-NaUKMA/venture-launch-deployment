export interface CreateMilestoneDto {
  mergedPullRequestUrl: string;
  projectId: string;
}

export interface UpdateMilestoneDto {
  mergedPullRequestUrl?: string;
  isFinal?: boolean;
  isWithdrawn?: boolean;
  transactionApprovalHash?: string;
}
