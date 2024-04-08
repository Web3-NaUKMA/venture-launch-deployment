import { DeleteResult } from 'typeorm';
import { AppDataSource } from '../../typeorm/index.typeorm';
import { Session } from '../../typeorm/models/Session';
import { User } from '../../typeorm/models/User';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { IAccountRegistrationData } from '../../DTO/auth.dto';

export const login = async (walletId: string, sessionId: string): Promise<User> => {
  const user = await AppDataSource.getRepository(User).findOneOrFail({ where: { walletId } });

  await AppDataSource.getRepository(Session).upsert(
    {
      expiresAt: new Date(Date.now() + Number(process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000)),
      sessionId,
      user,
    },
    ['user'],
  );

  return user;
};

export const register = async (user: IAccountRegistrationData): Promise<User> => {
  const exists = await AppDataSource.getRepository(User).exists({
    where: [{ email: user.email, username: user.username, walletId: user.walletId }],
  });

  if (exists) {
    throw new Error('The record with such email or username or walletId already exists.');
  }

  return AppDataSource.getRepository(User).save(user);
};

export const validateAuthToken = async (token: string | null): Promise<boolean | never> => {
  if (!token) {
    throw new Error('Auth token is missing.');
  }

  const authMessage = process.env.AUTH_MESSAGE;
  const [publicKey, _, signature] = token.split('.');

  if (!publicKey || !signature) return false;

  return nacl.sign.detached.verify(
    new TextEncoder().encode(authMessage),
    bs58.decode(signature),
    bs58.decode(publicKey),
  );
};

export const getUserSession = async (id: string): Promise<Session> => {
  return AppDataSource.getRepository(Session).findOneOrFail({ where: { user: { id } } });
};

export const getAuthenticatedUser = async (id: string): Promise<User> => {
  return AppDataSource.getRepository(User).findOneOrFail({ where: { id } });
};

export const logout = async (userId: string): Promise<DeleteResult> => {
  return AppDataSource.getRepository(Session).delete({ user: { id: userId } });
};
