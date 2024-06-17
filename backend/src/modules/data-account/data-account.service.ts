import AppDataSource from '../../typeorm/index.typeorm';
import { CreateDataAccountDto, UpdateDataAccountDto } from '../../DTO/data-account.dto';
import { DataAccount } from '../../typeorm/models/DataAccount';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import _ from 'lodash';

export class DataAccountService {
  async findMany(options?: FindManyOptions<DataAccount>): Promise<DataAccount[]> {
    try {
      return await AppDataSource.getRepository(DataAccount).find(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<DataAccount>): Promise<DataAccount> {
    try {
      return await AppDataSource.getRepository(DataAccount).findOneOrFail(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The data account with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateDataAccountDto): Promise<DataAccount> {
    try {
      return await AppDataSource.getRepository(DataAccount).save({
        ...data,
        project: { id: data.projectId },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateDataAccountDto): Promise<DataAccount> {
    try {
      await AppDataSource.getRepository(DataAccount).update({ id }, data);

      return await AppDataSource.getRepository(DataAccount).findOneOrFail({
        relations: { project: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update data account. The data account with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<DataAccount> {
    try {
      const dataAccount = await AppDataSource.getRepository(DataAccount).findOneOrFail({
        relations: { project: true },
        where: { id },
      });

      await AppDataSource.getRepository(DataAccount).remove(structuredClone(dataAccount));
      return dataAccount;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove data account. The data account with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new DataAccountService();
