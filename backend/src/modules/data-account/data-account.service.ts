import { AppDataSource } from '../../typeorm/index.typeorm';
import {
  ICreateDataAccountDto,
  IFindDataAccountDto,
  IUpdateDataAccountDto,
} from '../../DTO/data-account.dto';
import { DataAccount } from '../../typeorm/models/DataAccount';

export const findMany = async (options: IFindDataAccountDto): Promise<DataAccount[]> => {
  return AppDataSource.getRepository(DataAccount).find({
    relations: { project: true },
    where: options,
  });
};

export const findOne = async (options: IFindDataAccountDto): Promise<DataAccount> => {
  return AppDataSource.getRepository(DataAccount).findOneOrFail({
    relations: { project: true },
    where: options,
  });
};

export const create = async (data: ICreateDataAccountDto): Promise<DataAccount> => {
  return AppDataSource.getRepository(DataAccount).save({
    ...data,
    project: { id: data.projectId },
  });
};

export const update = async (id: string, data: IUpdateDataAccountDto): Promise<DataAccount> => {
  await AppDataSource.getRepository(DataAccount).update({ id }, data);

  return AppDataSource.getRepository(DataAccount).findOneOrFail({
    relations: { project: true },
    where: { id },
  });
};

export const remove = async (id: string): Promise<DataAccount> => {
  const dataAccount = await AppDataSource.getRepository(DataAccount).findOneOrFail({
    relations: { project: true },
    where: { id },
  });

  await AppDataSource.getRepository(DataAccount).remove(structuredClone(dataAccount));
  return dataAccount;
};
