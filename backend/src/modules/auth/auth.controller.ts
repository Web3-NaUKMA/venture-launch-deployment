import * as authService from './auth.service';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

export const login = async (request: Request, response: Response) => {
  try {
    const { token, publicKey } = request.body;
    if (!authService.validateAuthToken(token)) {
      return response
        .status(HttpStatusCode.Unauthorized)
        .json({ message: 'Cannot authenticate the user. Auth token is missing.' });
    }

    request.session.user = await authService.login(publicKey, request.sessionID);
    return response
      .setHeader(`Set-Cookie`, `${process.env.AUTH_TOKEN_NAME}=${token}; path=/; HttpOnly`)
      .status(HttpStatusCode.Created)
      .json(request.session.user);
  } catch (error) {
    return response
      .status(HttpStatusCode.Unauthorized)
      .json({ message: 'Cannot authenticate the user.' });
  }
};

export const register = async (request: Request, response: Response) => {
  try {
    const user = await authService.register(request.body);
    return response.status(HttpStatusCode.Created).json(user);
  } catch (error) {
    return response
      .status(HttpStatusCode.Unauthorized)
      .json({ message: 'Cannot register the user.' });
  }
};

export const user = async (request: Request, response: Response) => {
  try {
    if (!request.session.user) {
      throw new Error('The user is unauthorized.');
    }

    const user = await authService.getAuthenticatedUser(request.session.user.id);
    return response.status(HttpStatusCode.Ok).json(user);
  } catch (error) {
    return response
      .status(HttpStatusCode.Unauthorized)
      .json({ message: 'The user is unauthorized.' });
  }
};

export const logout = async (request: Request, response: Response) => {
  const user = request.session.user;

  return request.session.destroy(async error => {
    if (error) console.log(error);

    try {
      if (!user) {
        throw new Error('The user is unauthorized.');
      }

      await authService.logout(user.id);
      return response
        .clearCookie('connect.sid')
        .clearCookie(process.env.AUTH_TOKEN_NAME ?? 'X-Access-Token')
        .status(HttpStatusCode.Created)
        .json({ message: 'The user was successfully logged out.' });
    } catch (error) {
      return response
        .clearCookie('connect.sid')
        .clearCookie(process.env.AUTH_TOKEN_NAME ?? 'X-Access-Token')
        .status(HttpStatusCode.Unauthorized)
        .json({ message: 'The user is unauthorized.' });
    }
  });
};
