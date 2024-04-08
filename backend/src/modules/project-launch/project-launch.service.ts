import { AppDataSource } from '../../typeorm/index.typeorm';
import { FindOptionsOrder } from 'typeorm';
import { formatQueryOptions } from '../../utils/typeorm.utils';
import { ProjectLaunch } from '../../typeorm/models/ProjectLaunch';
import {
  ICreateProjectLaunchDto,
  IFindProjectLaunchDto,
  IUpdateProjectLaunchDto,
} from '../../DTO/project-launch.dto';
import {
  ICreateProjectLaunchInvestmentDto,
  IUpdateProjectLaunchInvestmentDto,
} from '../../DTO/project-launch-investment.dto';
import { ProjectLaunchInvestment } from '../../typeorm/models/ProjectLaunchInvestment';

export const findMany = async (
  options: IFindProjectLaunchDto,
  order?: FindOptionsOrder<ProjectLaunch>,
): Promise<ProjectLaunch[]> => {
  const formattedOptions = formatQueryOptions(options);

  return AppDataSource.getRepository(ProjectLaunch).find({
    relations: {
      author: true,
      project: true,
      projectLaunchInvestments: true,
    },
    where: formattedOptions,
    order,
  });
};

export const findOne = async (
  options: IFindProjectLaunchDto,
  order?: FindOptionsOrder<ProjectLaunch>,
): Promise<ProjectLaunch> => {
  const formattedOptions = formatQueryOptions(options);

  return AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
    relations: {
      author: true,
      project: true,
      projectLaunchInvestments: true,
    },
    where: formattedOptions,
    order,
  });
};

export const create = async (data: ICreateProjectLaunchDto): Promise<ProjectLaunch> => {
  const exists = await AppDataSource.getRepository(ProjectLaunch).exists({
    where: {
      name: data.name,
      author: { id: data.authorId },
    },
  });

  if (exists) {
    throw new Error('The record with such name already exists.');
  }

  const projectLaunch = await AppDataSource.getRepository(ProjectLaunch).save({
    ...data,
    author: { id: data.authorId },
  });

  return AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
    where: { id: projectLaunch.id },
    relations: { author: true, project: true },
  });
};

export const update = async (id: string, data: IUpdateProjectLaunchDto): Promise<ProjectLaunch> => {
  await AppDataSource.getRepository(ProjectLaunch).update({ id }, data);

  return AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
    relations: {
      author: true,
      project: true,
    },
    where: { id },
  });
};

export const remove = async (id: string): Promise<ProjectLaunch> => {
  const projectLaunch = await AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
    relations: {
      author: true,
      project: true,
    },
    where: { id },
  });

  await AppDataSource.getRepository(ProjectLaunch).remove(structuredClone(projectLaunch));
  return projectLaunch;
};

export const createInvestment = async (
  id: string,
  data: ICreateProjectLaunchInvestmentDto,
): Promise<ProjectLaunchInvestment> => {
  const projectLaunchInvestment = await AppDataSource.getRepository(ProjectLaunchInvestment).save({
    ...data,
    investor: { id: data.investorId },
    projectLaunch: { id },
  });

  const projectLaunch = await AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
    where: { id },
    relations: { projectLaunchInvestments: true },
  });

  const fundraiseProgress = await AppDataSource.getRepository(ProjectLaunchInvestment).sum(
    'amount',
    { projectLaunch: { id } },
  );

  let projectLaunchUpdateData: any = {
    fundraiseProgress,
  };

  if ((fundraiseProgress ?? 0) >= projectLaunch.fundraiseAmount) {
    projectLaunchUpdateData = { ...projectLaunchUpdateData, isFundraised: true };
  }

  await AppDataSource.getRepository(ProjectLaunch).update({ id }, projectLaunchUpdateData);

  return AppDataSource.getRepository(ProjectLaunchInvestment).findOneOrFail({
    where: { id: projectLaunchInvestment.id },
    relations: { investor: true, projectLaunch: true },
  });
};

export const updateInvestment = async (
  id: string,
  investorId: string,
  data: IUpdateProjectLaunchInvestmentDto,
): Promise<ProjectLaunchInvestment> => {
  await AppDataSource.getRepository(ProjectLaunchInvestment).update(
    { projectLaunch: { id }, investor: { id: investorId } },
    data,
  );

  return AppDataSource.getRepository(ProjectLaunchInvestment).findOneOrFail({
    relations: {
      investor: true,
      projectLaunch: true,
    },
    where: { projectLaunch: { id }, investor: { id: investorId } },
  });
};
