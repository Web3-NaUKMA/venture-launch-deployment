import { DeleteResult, EntityNotFoundError } from 'typeorm';
import { AppDataSource } from '../../typeorm/index.typeorm';
import { Session } from '../../typeorm/models/Session';
import { User } from '../../typeorm/models/User';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { IAccountRegistrationData } from '../../DTO/auth.dto';
import {
  AuthException,
  ConflictException,
  DatabaseException,
  ServerException,
} from '../../utils/exceptions/exceptions.utils';

export class AuthService {
  async login(token: string, walletId: string, sessionId: string): Promise<User> {
    try {
      if (!this.validateAuthToken(token)) {
        throw new AuthException('Cannot authenticate the user. Auth token is missing');
      }

      const user = await AppDataSource.getRepository(User).findOneOrFail({ where: { walletId } });

      await AppDataSource.getRepository(Session).upsert(
        {
          expiresAt: new Date(
            Date.now() + Number(process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000),
          ),
          sessionId,
          user,
        },
        ['user'],
      );

      return user;
    } catch (error: any) {
      if (error instanceof AuthException) {
        throw error;
      }

      if (error instanceof EntityNotFoundError) {
        throw new AuthException('Cannot authenticate the user with provided credentials', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async register(user: IAccountRegistrationData): Promise<User> {
    try {
      const exists = await AppDataSource.getRepository(User).exists({
        where: [{ email: user.email }, { username: user.username }, { walletId: user.walletId }],
      });

      if (exists) {
        throw new ConflictException(
          'The record with such email or username or walletId already exists',
        );
      }

      return AppDataSource.getRepository(User).save(user);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async validateAuthToken(token: string | null): Promise<boolean | never> {
    try {
      if (!token) {
        throw new AuthException('Auth token is missing.');
      }

      const authMessage = process.env.AUTH_MESSAGE;
      const [publicKey, _, signature] = token.split('.');

      if (!publicKey || !signature) return false;

      return nacl.sign.detached.verify(
        new TextEncoder().encode(authMessage),
        bs58.decode(signature),
        bs58.decode(publicKey),
      );
    } catch (error: any) {
      if (error instanceof AuthException) {
        throw error;
      }

      throw new ServerException('Internal server error', error);
    }
  }

  async getUserSession(id: string): Promise<Session> {
    try {
      return await AppDataSource.getRepository(Session).findOneOrFail({ where: { user: { id } } });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new AuthException('The session with provided sessionID was not found', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async getAuthenticatedUser(id: string): Promise<User> {
    try {
      return await AppDataSource.getRepository(User).findOneOrFail({ where: { id } });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new AuthException('Cannot retrieve the data about the authenticated user', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async logout(userId: string): Promise<DeleteResult> {
    try {
      return AppDataSource.getRepository(Session).delete({ user: { id: userId } });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new AuthException('The user is not authenticated', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new AuthService();
