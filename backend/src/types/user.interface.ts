import { Chat } from './chat.interface';
import { UserRoleEnum } from './enums/user-role.enum';
import { Message } from './message.interface';
import { ProjectLaunchInvestment } from './project-launch-investment.interface';
import { ProjectLaunch } from './project-launch.interface';
import { UserToChat } from './user-to-chat.interface';

export interface User {
  id: string;
  walletId: string;
  username: string;
  email: string;
  role: UserRoleEnum[];
  createdAt: Date;
  password?: string | null;
  avatar?: string | null;
  bio?: string | null;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zipCode?: string;
  phone?: string;
  projectLaunches: ProjectLaunch[];
  approvedProjectLaunches: ProjectLaunch[];
  projectLaunchInvestments?: ProjectLaunchInvestment[];
  userToChats: UserToChat[];
  archivedChats: Chat[];
  favouriteChats: Chat[];
  messages: Message[];
  seenMessages: Message[];
}
