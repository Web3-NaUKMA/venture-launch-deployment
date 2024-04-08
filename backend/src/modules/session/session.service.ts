import { ICreateSessionDto, IFindSessionDto, IUpdateSessionDto } from '../../DTO/session.dto';
import { Session } from '../../typeorm/models/Session';
import { AppDataSource } from '../../typeorm/index.typeorm';

export const findMany = async (options: IFindSessionDto): Promise<Session[]> => {
  return AppDataSource.getRepository(Session).find({
    relations: { user: true },
    where: options,
  });
};

export const findOne = async (options: IFindSessionDto): Promise<Session> => {
  return AppDataSource.getRepository(Session).findOneOrFail({
    relations: { user: true },
    where: options,
  });
};

export const create = async (data: ICreateSessionDto): Promise<Session> => {
  const exists = await AppDataSource.getRepository(Session).exists({
    where: [{ sessionId: data.sessionId }, { user: { id: data.userId } }],
  });

  if (exists) {
    throw new Error('The record with such sessionId or userId already exists.');
  }

  return AppDataSource.getRepository(Session).save({
    sessionId: data.sessionId,
    user: { id: data.userId },
    expiresAt: data.expiresAt,
  });
};

export const update = async (sessionId: string, data: IUpdateSessionDto): Promise<Session> => {
  await AppDataSource.getRepository(Session).update({ sessionId }, data);

  return AppDataSource.getRepository(Session).findOneOrFail({
    relations: { user: true },
    where: { sessionId: data.sessionId ? data.sessionId : sessionId },
  });
};

export const remove = async (sessionId: string): Promise<Session> => {
  const session = await AppDataSource.getRepository(Session).findOneOrFail({
    relations: { user: true },
    where: { sessionId },
  });

  await AppDataSource.getRepository(Session).remove(structuredClone(session));
  return session;
};
