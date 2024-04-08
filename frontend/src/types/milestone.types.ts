export interface IMilestone {
  id: string;
  mergedPullRequestUrl: string;
  isFinal: boolean;
  isWithdrawn: boolean;
  transactionApprovalHash: string;
  createdAt: Date;
  projectId: string;
}

export interface ICreateMilestone {
  mergedPullRequestUrl: string;
  transactionApprovalHash: string;
  projectId: string;
}

export interface IUpdateMilestone {
  isFinal?: boolean;
  isWithdrawn?: boolean;
  transactionApprovalHash?: string;
}
