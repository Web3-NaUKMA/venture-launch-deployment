export interface ICreateSessionDto {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export interface IUpdateSessionDto {
  sessionId?: string;
  userId?: string;
  expiresAt?: Date;
}

export interface IFindSessionDto {
  sessionId?: string;
  user?: { id: string };
  expiresAt?: Date;
}
