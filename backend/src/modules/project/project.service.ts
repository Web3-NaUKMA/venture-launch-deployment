import { AppDataSource } from '../../typeorm/index.typeorm';
import { ICreateProjectDto, IFindProjectDto, IUpdateProjectDto } from '../../DTO/project.dto';
import { Project } from '../../typeorm/models/Project';
import { UserToProject } from '../../typeorm/models/UsersToProjects';
import { FindOptionsOrder } from 'typeorm';
import { IMilestone } from '../../types/milestone.interface';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { formatQueryOptions } from '../../utils/typeorm.utils';
import { DataAccount } from '../../typeorm/models/DataAccount';
import { ProjectLaunch } from '../../typeorm/models/ProjectLaunch';

export const findMany = async (
  options: IFindProjectDto,
  order?: FindOptionsOrder<Project>,
): Promise<Project[]> => {
  const formattedOptions = formatQueryOptions(options);

  return AppDataSource.getRepository(Project).find({
    relations: {
      projectLaunch: { author: true, projectLaunchInvestments: true },
      dataAccount: true,
      milestones: true,
      userToProjects: { project: true },
    },
    where: formattedOptions,
    order,
  });
};

export const findOne = async (
  options: IFindProjectDto,
  order?: FindOptionsOrder<Project>,
): Promise<Project> => {
  const formattedOptions = formatQueryOptions(options);

  return AppDataSource.getRepository(Project).findOneOrFail({
    relations: {
      projectLaunch: { author: true, projectLaunchInvestments: true },
      dataAccount: true,
      milestones: true,
      userToProjects: { project: true },
    },
    where: formattedOptions,
    order,
  });
};

export const create = async (data: ICreateProjectDto): Promise<Project> => {
  const exists = await AppDataSource.getRepository(Project).exists({
    where: {
      projectLaunchName: data.projectLaunchName,
      projectLaunch: { id: data.projectLaunchId },
    },
  });

  if (exists) {
    throw new Error('The record with such name already exists.');
  }

  const project = await AppDataSource.getRepository(Project).save({
    ...data,
    projectLaunch: { id: data.projectLaunchId },
  });

  await AppDataSource.getRepository(ProjectLaunch).update(
    { id: data.projectLaunchId },
    { project: { id: project.id } },
  );

  if (data.users && data.users.length) {
    const userToProjectEntities = data.users.map(user => ({
      userId: user,
      user: { id: user },
      projectId: project.id,
      project: { id: project.id },
    }));

    await AppDataSource.getRepository(UserToProject).save(userToProjectEntities);
  }

  return AppDataSource.getRepository(Project).findOneOrFail({
    where: { id: project.id },
    relations: { projectLaunch: { author: true, projectLaunchInvestments: true } },
  });
};

export const update = async (id: string, data: IUpdateProjectDto): Promise<Project> => {
  const { users, dataAccountHash, ...projectData } = data;

  if (Object.entries(projectData).length) {
    await AppDataSource.getRepository(Project).update({ id }, projectData);
  }

  if (dataAccountHash?.trim()) {
    await AppDataSource.getRepository(DataAccount).upsert(
      { accountHash: dataAccountHash, project: { id } },
      ['project'],
    );
  }

  if (users && users.length) {
    const userToProjectEntities = users.map(user => ({
      userId: user,
      user: { id: user },
      projectId: id,
      project: { id },
    }));

    await AppDataSource.getRepository(UserToProject).delete({ project: { id } });
    await AppDataSource.getRepository(UserToProject).save(userToProjectEntities);
  }

  return AppDataSource.getRepository(Project).findOneOrFail({
    relations: {
      projectLaunch: { author: true, projectLaunchInvestments: true },
      dataAccount: true,
      milestones: true,
      userToProjects: { project: true },
    },
    where: { id },
  });
};

export const remove = async (id: string): Promise<Project> => {
  const project = await AppDataSource.getRepository(Project).findOneOrFail({
    relations: {
      projectLaunch: { author: true, projectLaunchInvestments: true },
      dataAccount: true,
      milestones: true,
      userToProjects: { project: true },
    },
    where: { id },
  });

  await AppDataSource.getRepository(Project).remove(structuredClone(project));
  return project;
};

export const prepareNftMetadata = async (project: any) => {
  const metadata = {
    name: project.name,
    authors: (project.authors ?? []).join(', '),
    symbol: '',
    description: project.description,
    seller_fee_basis_points: 1,
    external_url: '',
    edition: '',
    background_color: '000000',
    milestoneHashes: project.milestones.map(
      (milestone: IMilestone) => milestone.transactionApprovalHash,
    ),
    image: process.env.NFT_DEFAULT_IMAGE,
  };

  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_STORAGE_SECRET,
  });

  const fileBuffer = Buffer.from(JSON.stringify(metadata));
  const uri = await storage.upload(fileBuffer);
  return storage.resolveScheme(uri);
};
