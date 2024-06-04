import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { AuthException } from '../../utils/exceptions/exceptions.utils';
import authService from './auth.service';

@Controller()
export class AuthController {
  async login(request: Request, response: Response) {
    const { token, publicKey } = request.body;
    request.session.user = await authService.login(token, publicKey, request.sessionID);

    return response
      .setHeader(`Set-Cookie`, `${process.env.AUTH_TOKEN_NAME}=${token}; path=/; HttpOnly`)
      .status(HttpStatusCode.Created)
      .json(request.session.user);
  }

  async register(request: Request, response: Response) {
    const user = await authService.register(request.body);

    return response.status(HttpStatusCode.Created).json(user);
  }

  async user(request: Request, response: Response) {
    if (!request.session.user) {
      throw new AuthException(
        'The user is unauthorized',
        'The information about authenticated user is missing in the request session object',
      );
    }

    const user = await authService.getAuthenticatedUser(request.session.user.id);

    return response.status(HttpStatusCode.Ok).json(user);
  }

  async logout(request: Request, response: Response) {
    const user = request.session.user;

    if (!user) {
      throw new AuthException('The user is unauthorized');
    }

    return request.session.destroy(async error => {
      console.log(error);

      try {
        await authService.logout(user.id);
      } catch (err) {
        console.log(err);
      }

      return response
        .clearCookie('connect.sid')
        .clearCookie(process.env.AUTH_TOKEN_NAME ?? 'X-Access-Token')
        .status(HttpStatusCode.Created)
        .json({ message: 'The user was successfully logged out' });
    });
  }
}

export default new AuthController();
