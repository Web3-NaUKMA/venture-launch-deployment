export interface IMilestone {
  id: string;
  mergedPullRequestUrl: string;
  isFinal: boolean;
  isWithdrawn: boolean;
  transactionApprovalHash: string | null;
  createdAt: Date;
}
