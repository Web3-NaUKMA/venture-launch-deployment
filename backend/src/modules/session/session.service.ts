import { CreateSessionDto, UpdateSessionDto } from '../../DTO/session.dto';
import { Session } from '../../typeorm/models/Session';
import AppDataSource from '../../typeorm/index.typeorm';
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
} from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError, FindManyOptions } from 'typeorm';
import _ from 'lodash';

export class SessionService {
  async findMany(options?: FindManyOptions<Session>): Promise<Session[]> {
    try {
      return await AppDataSource.getRepository(Session).find(
        _.merge(options, {
          relations: { user: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindManyOptions<Session>): Promise<Session> {
    try {
      return await AppDataSource.getRepository(Session).findOneOrFail(
        _.merge(options, {
          relations: { user: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The session with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateSessionDto): Promise<Session> {
    try {
      const exists = await AppDataSource.getRepository(Session).exists({
        where: [{ sessionId: data.sessionId }, { user: { id: data.userId } }],
      });

      if (exists) {
        throw new ConflictException(
          'Cannot create the session. The record with provided sessionId and userId already exist',
        );
      }

      return await AppDataSource.getRepository(Session).save({
        sessionId: data.sessionId,
        user: { id: data.userId },
        expiresAt: data.expiresAt,
      });
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(sessionId: string, data: UpdateSessionDto): Promise<Session> {
    try {
      await AppDataSource.getRepository(Session).update({ sessionId }, data);

      return await AppDataSource.getRepository(Session).findOneOrFail({
        relations: { user: true },
        where: { sessionId: data.sessionId ? data.sessionId : sessionId },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the session. The session with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(sessionId: string): Promise<Session> {
    try {
      const session = await AppDataSource.getRepository(Session).findOneOrFail({
        relations: { user: true },
        where: { sessionId },
      });

      await AppDataSource.getRepository(Session).remove(structuredClone(session));
      return session;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the session. The session with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }
}

export default new SessionService();
