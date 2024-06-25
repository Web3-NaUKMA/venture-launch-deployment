export interface CreateProjectLaunchDto {
  name: string;
  description: string;
  logo: string | null;
  fundraiseAmount: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: JSON;
  businessModel: string;
  tokenomics: string;
  roundDetails: JSON;
  authorId: string;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
}

export interface UpdateProjectLaunchDto {
  name?: string;
  description?: string;
  logo?: string | null;
  isFundraised?: boolean;
  approverId?: string;
  fundraiseAmount?: number;
  fundraiseProgress?: number;
  fundraiseDeadline?: Date;
  projectDocuments?: string[];
  team?: JSON;
  businessModel?: string;
  tokenomics?: string;
  roundDetails?: JSON;
  vaultTokenAccount?: string;
  cryptoTrackerAccount?: string;
  businessAnalystReview?: string | null;
}
