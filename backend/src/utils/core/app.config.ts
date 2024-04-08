import { IUser } from '../../types/user.interface';

// Allows to set user property for request.session object
declare module 'express-session' {
  interface SessionData {
    user: IUser;
    // Other necessary properties can be added here
  }
}
