import { DeleteResult, EntityNotFoundError } from 'typeorm';
import { AppDataSource } from '../../typeorm/index.typeorm';
import { Session } from '../../typeorm/models/Session';
import { User } from '../../typeorm/models/User';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { AccountRegistrationData } from '../../DTO/auth.dto';
import {
  AuthException,
  ConflictException,
  DatabaseException,
  ServerException,
} from '../../utils/exceptions/exceptions.utils';
import {
  GenerateGoogleOAuth2Response,
  GenerateJwtTokensResponse,
  LoginWithGoogleResponse,
  OAuthPayload,
} from '../../types/core/auth.types';
import { Auth, google } from 'googleapis';
import * as jose from 'jose';
import passwordService from '../password/password.service';

export class AuthService {
  private readonly googleOauth2Client: Auth.OAuth2Client;

  constructor() {
    this.googleOauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH2_CLIENT_ID,
      process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
      `${process.env.BACKEND_URI}/oauth/callback/google`,
    );
  }

  async loginWithWallet(token: string, walletId: string, sessionId: string): Promise<User> {
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

  async loginWithGoogle(
    googleAccessToken: string,
    sessionId: string,
  ): Promise<LoginWithGoogleResponse | never> {
    try {
      if (!googleAccessToken) {
        throw new AuthException(
          'Cannot authenticate the user with Google. The Google access token is missing',
        );
      }

      const { email } = await this.googleOauth2Client.getTokenInfo(googleAccessToken);
      const user = await AppDataSource.getRepository(User).findOneOrFail({ where: { email } });
      const { accessToken } = await this.generateJwtTokens(user);

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

      return { user, accessToken };
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

  async loginWithCredentials(
    email: string,
    password: string,
    sessionId: string,
  ): Promise<LoginWithGoogleResponse | never> {
    try {
      const user = await AppDataSource.getRepository(User).findOneOrFail({ where: { email } });
      const isPasswordCorrect = await passwordService.compare(password, user.password);

      if (!user.password || !isPasswordCorrect) {
        throw new AuthException('Cannot authenticate user with provided credentials');
      }

      const { accessToken } = await this.generateJwtTokens(user);

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

      return { user, accessToken };
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

  async register(user: AccountRegistrationData): Promise<User> {
    try {
      const exists = await AppDataSource.getRepository(User).exists({
        where: [{ email: user.email }, { username: user.username }, { walletId: user.walletId }],
      });

      if (exists) {
        throw new ConflictException(
          'The record with such email or username or walletId already exists',
        );
      }

      if (user.password) {
        user.password = await passwordService.hash(user.password);
      }

      return AppDataSource.getRepository(User).save(user);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async validateAuthToken(token: string): Promise<boolean> {
    return (
      (await this.tryValidateAuthWalletToken(token)) || (await this.tryValidateAuthJwtToken(token))
    );
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

  private async tryValidateAuthWalletToken(token: string): Promise<boolean | never> {
    try {
      const authMessage = process.env.AUTH_MESSAGE;
      const [publicKey, _, signature] = token.split('.');

      if (!publicKey || !signature) return false;

      return nacl.sign.detached.verify(
        new TextEncoder().encode(authMessage),
        bs58.decode(signature),
        bs58.decode(publicKey),
      );
    } catch (error: any) {
      console.log(error);
      return false;
    }
  }

  private async tryValidateAuthJwtToken(token: string): Promise<boolean | never> {
    try {
      return Boolean(await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)));
    } catch (error: any) {
      console.log(error);
      return false;
    }
  }

  private async generateJwtTokens(user: User): Promise<GenerateJwtTokensResponse> {
    const accessToken = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      walletId: user.walletId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER || 'VentureLaunch')
      .setAudience(process.env.JWT_AUDIENCE || 'VentureLaunch')
      .setExpirationTime(process.env.JWT_ACCESS_TOKEN_DURATION || '1d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    return { accessToken };
  }

  async generateGoogleOAuth2Url(payload: OAuthPayload): Promise<string> {
    return this.googleOauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
      state: JSON.stringify(payload),
    });
  }

  async generateGoogleOAuth2Token(code: string, state: any): Promise<GenerateGoogleOAuth2Response> {
    try {
      const { tokens } = await this.googleOauth2Client.getToken(code || '');
      const { email } = await this.googleOauth2Client.getTokenInfo(tokens.access_token || '');

      if (!tokens.access_token || !email) {
        throw new AuthException('Cannot authenticate the user with provided credentials');
      }

      const token = await new jose.SignJWT({
        email,
        accessToken: tokens.access_token,
        referer: state.referer,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('60s')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

      return { token };
    } catch (error: any) {
      if (error instanceof AuthException) {
        throw error;
      }

      throw new ServerException('Internal server error', error);
    }
  }
}

export default new AuthService();
