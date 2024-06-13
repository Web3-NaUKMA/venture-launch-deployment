import AppDataSource from '../../typeorm/index.typeorm';
import {
  ICreateDataAccountDto,
  IFindDataAccountDto,
  IUpdateDataAccountDto,
} from '../../DTO/data-account.dto';
import { DataAccount } from '../../typeorm/models/DataAccount';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError } from 'typeorm';

export class DataAccountService {
  async findMany(options: IFindDataAccountDto): Promise<DataAccount[]> {
    try {
      return await AppDataSource.getRepository(DataAccount).find({
        relations: { project: true },
        where: options,
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options: IFindDataAccountDto): Promise<DataAccount> {
    try {
      return await AppDataSource.getRepository(DataAccount).findOneOrFail({
        relations: { project: true },
        where: options,
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The data account with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: ICreateDataAccountDto): Promise<DataAccount> {
    try {
      return await AppDataSource.getRepository(DataAccount).save({
        ...data,
        project: { id: data.projectId },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: IUpdateDataAccountDto): Promise<DataAccount> {
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
