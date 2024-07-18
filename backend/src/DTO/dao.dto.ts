export interface DaoMemberDto {
  id: string;
}

export interface CreateDaoDto {
  multisigPda: string;
  vaultPda: string;
  projectLaunch: { id: string };
}

export interface UpdateDaoDto {
  membersToAdd?: DaoMemberDto[];
  membersToRemove?: DaoMemberDto[];
  threshold?: number;
  updatedAt?: Date | null;
  removedAt?: Date | null;
}

export interface BlockchainCreateDaoDto {
  project_id: string;
}

export interface BlockchainAddMemberDto {
  project_id: string;
  pubkey: string;
  permissions: [string];
}

export interface BlockchainRemoveMemberDto {
  project_id: string;
  pubkey: string;
}

export interface BlockchainWithdrawDto {
  project_id: string;
  is_execute: boolean;
  receiver: string;
  amount: Number;
}

export interface BlockchainChangeThresholdDto {
  project_id: string;
  new_threshold: Number;
}

export interface BlockchainExecuteProposalDto {
  project_id: string;
}

export interface BlockchainVoteDto {
  project_id: string;
  voter: string;
  vote: string; // approve cancel
}
