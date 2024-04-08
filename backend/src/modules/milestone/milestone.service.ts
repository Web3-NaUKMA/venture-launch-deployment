import { AppDataSource } from '../../typeorm/index.typeorm';
import {
  ICreateMilestoneDto,
  IFindMilestoneDto,
  IUpdateMilestoneDto,
} from '../../DTO/milestone.dto';
import { Milestone } from '../../typeorm/models/Milestone';
import { FindOptionsOrder } from 'typeorm';

export const findMany = async (
  options: IFindMilestoneDto,
  order?: FindOptionsOrder<Milestone>,
): Promise<Milestone[]> => {
  return AppDataSource.getRepository(Milestone).find({
    relations: { project: true },
    where: options,
    order,
  });
};

export const findOne = async (options: IFindMilestoneDto): Promise<Milestone> => {
  return AppDataSource.getRepository(Milestone).findOneOrFail({
    relations: { project: true },
    where: options,
  });
};

export const create = async (data: ICreateMilestoneDto): Promise<Milestone> => {
  return AppDataSource.getRepository(Milestone).save({
    ...data,
    project: { id: data.projectId },
  });
};

export const update = async (id: string, data: IUpdateMilestoneDto): Promise<Milestone> => {
  await AppDataSource.getRepository(Milestone).update({ id }, data);

  return AppDataSource.getRepository(Milestone).findOneOrFail({
    relations: { project: true },
    where: { id },
  });
};

export const remove = async (id: string): Promise<Milestone> => {
  const milestone = await AppDataSource.getRepository(Milestone).findOneOrFail({
    relations: { project: true },
    where: { id },
  });

  await AppDataSource.getRepository(Milestone).remove(structuredClone(milestone));
  return milestone;
};
