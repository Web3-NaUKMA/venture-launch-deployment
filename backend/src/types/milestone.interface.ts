export interface Milestone {
  id: string;
  mergedPullRequestUrl: string;
  description: string;
  isFinal: boolean;
  isWithdrawn: boolean;
  transactionApprovalHash: string | null;
  createdAt: Date;
}
