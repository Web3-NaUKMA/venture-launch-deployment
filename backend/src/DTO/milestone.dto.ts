export interface ICreateMilestoneDto {
  mergedPullRequestUrl: string;
  projectId: string;
}

export interface IUpdateMilestoneDto {
  mergedPullRequestUrl?: string;
  isFinal?: boolean;
  isWithdrawn?: boolean;
  transactionApprovalHash?: string;
}

export interface IFindMilestoneDto {
  id?: string;
  projectId?: { id: string };
  mergedPullRequestUrl?: string;
  transactionApprovalHash?: string;
  isFinal?: boolean;
  isWithdrawn?: boolean;
  createdAt?: Date;
}
