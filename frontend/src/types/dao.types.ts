import { ProjectLaunch } from 'types/project-launch.types';
import { User } from 'types/user.types';

export interface Dao {
  id: string;
  multisigPda: string;
  vaultPda: string;
  members: User[];
  projectLaunch: ProjectLaunch;
  threshold: number;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
}
