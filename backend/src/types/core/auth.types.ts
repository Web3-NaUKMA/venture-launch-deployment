import { IUser } from '../user.interface';

export interface LoginWithGoogleResponse {
  accessToken: string;
  user: IUser;
}

export interface LoginWithCredentialsResponse {
  accessToken: string;
  user: IUser;
}

export interface GenerateJwtTokensResponse {
  accessToken: string;
}

export interface OAuthPayload {
  referer: string;
}

export interface GenerateGoogleOAuth2Response {
  token: string;
}
