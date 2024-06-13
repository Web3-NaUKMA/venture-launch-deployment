import AppDataSource from '../../typeorm/index.typeorm';
import { ICreateUserDto, IUpdateUserDto } from '../../DTO/user.dto';
import { User } from '../../typeorm/models/User';
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
} from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import passwordService from '../password/password.service';
import _ from 'lodash';

export class UserService {
  async findMany(options?: FindManyOptions<User>): Promise<User[]> {
    try {
      return await AppDataSource.getRepository(User).find(
        _.merge(options, {
          relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<User>): Promise<User> {
    try {
      return await AppDataSource.getRepository(User).findOneOrFail(
        _.merge(options, {
          relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The user with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: ICreateUserDto): Promise<User> {
    try {
      const exists = await AppDataSource.getRepository(User).exists({
        where: [{ email: data.email, username: data.username, walletId: data.walletId }],
      });

      if (exists) {
        throw new ConflictException(
          'Cannot create a user. The record with such email or username or walletId already exists',
        );
      }

      return await AppDataSource.getRepository(User).save(data);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }

  async update(id: string, data: IUpdateUserDto): Promise<User> {
    try {
      if (data.password?.trim()) {
        data.password = await passwordService.hash(data.password);
      } else {
        delete data.password;
      }

      await AppDataSource.getRepository(User).update({ id }, data);

      return await AppDataSource.getRepository(User).findOneOrFail({
        relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the user. The user with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const user = await AppDataSource.getRepository(User).findOneOrFail({
        relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        where: { id },
      });

      await AppDataSource.getRepository(User).remove(structuredClone(user));

      return user;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the user. The user with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }
}

export default new UserService();
