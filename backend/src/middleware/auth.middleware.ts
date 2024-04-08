import { NextFunction, Request, Response } from 'express';
import * as authService from '../modules/auth/auth.service';
import { HttpStatusCode } from 'axios';
import { UserRoleEnum } from '../types/enums/user-role.enum';

export const auth = (roles: UserRoleEnum[] = []) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = request.session.user;

      if (!user) {
        throw new Error('The user is unauthorized.');
      }

      const authTokenName = process.env.AUTH_TOKEN_NAME ?? 'X-Access-Token';
      const token = request.cookies?.[authTokenName as any];

      const session = await authService.getUserSession(user.id);
      const tokenIsValid = token && (await authService.validateAuthToken(token));

      if (!tokenIsValid || new Date(session.expiresAt).getTime() <= Date.now()) {
        await authService.logout(user.id);
        return response
          .clearCookie('connect.sid')
          .clearCookie(process.env.AUTH_TOKEN_NAME ?? 'X-Access-Token')
          .status(HttpStatusCode.Unauthorized)
          .json({ message: 'The user is unauthorized. Auth token is missing or expired.' });
      }

      if (roles.length > 0 && !roles.find(role => user.role.includes(role))) {
        return response.status(HttpStatusCode.Forbidden).json({
          message: 'The user is forbidden to perform this action.',
        });
      }
    } catch (error) {
      return response.status(HttpStatusCode.Unauthorized).json({
        message: 'The user is unauthorized.',
      });
    }

    return next();
  };
};
