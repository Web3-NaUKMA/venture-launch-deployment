import { AppDataSource } from '../../typeorm/index.typeorm';
import { ICreateUserDto, IFindUserDto, IUpdateUserDto } from '../../DTO/user.dto';
import { User } from '../../typeorm/models/User';
import { ArrayContains } from 'typeorm';
import { formatQueryOptions } from '../../utils/typeorm.utils';

export const findMany = async (options: IFindUserDto): Promise<User[]> => {
  const formattedOptions = formatQueryOptions(options);

  return AppDataSource.getRepository(User).find({
    relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
    where: formattedOptions,
  });
};

export const findOne = async (options: IFindUserDto): Promise<User> => {
  const formattedOptions = formatQueryOptions(options);

  return AppDataSource.getRepository(User).findOneOrFail({
    relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
    where: formattedOptions,
  });
};

export const create = async (data: ICreateUserDto): Promise<User> => {
  const exists = await AppDataSource.getRepository(User).exists({
    where: [{ email: data.email, username: data.username, walletId: data.walletId }],
  });

  if (exists) {
    throw new Error('The record with such email or username or walletId already exists.');
  }

  return AppDataSource.getRepository(User).save(data);
};

export const update = async (id: string, data: IUpdateUserDto): Promise<User> => {
  await AppDataSource.getRepository(User).update({ id }, data);

  return AppDataSource.getRepository(User).findOneOrFail({
    relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
    where: { id },
  });
};

export const remove = async (id: string): Promise<User> => {
  const user = await AppDataSource.getRepository(User).findOneOrFail({
    relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
    where: { id },
  });

  await AppDataSource.getRepository(User).remove(structuredClone(user));
  return user;
};
