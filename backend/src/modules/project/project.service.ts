import AppDataSource from '../../typeorm/index.typeorm';
import { ICreateProjectDto, IUpdateProjectDto } from '../../DTO/project.dto';
import { Project } from '../../typeorm/models/Project';
import { UserToProject } from '../../typeorm/models/UsersToProjects';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { IMilestone } from '../../types/milestone.interface';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { DataAccount } from '../../typeorm/models/DataAccount';
import { ProjectLaunch } from '../../typeorm/models/ProjectLaunch';
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
  ServerException,
} from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';

export class ProjectService {
  async findMany(options?: FindManyOptions<Project>): Promise<Project[]> {
    try {
      return await AppDataSource.getRepository(Project).find(
        _.merge(options, {
          relations: {
            projectLaunch: { author: true, projectLaunchInvestments: true, approver: true },
            dataAccount: true,
            milestones: true,
            userToProjects: { project: true },
          },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options: FindOneOptions<Project>): Promise<Project> {
    try {
      return await AppDataSource.getRepository(Project).findOneOrFail(
        _.merge(options, {
          relations: {
            projectLaunch: { author: true, projectLaunchInvestments: true, approver: true },
            dataAccount: true,
            milestones: true,
            userToProjects: { project: true },
          },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The project with provided params does not exist');
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }

  async create(data: ICreateProjectDto): Promise<Project> {
    try {
      const exists = await AppDataSource.getRepository(Project).exists({
        where: {
          projectLaunchName: data.projectLaunchName,
          projectLaunch: { id: data.projectLaunchId },
        },
      });

      if (exists) {
        throw new ConflictException('The record with such name already exists');
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

      return await AppDataSource.getRepository(Project).findOneOrFail({
        where: { id: project.id },
        relations: {
          projectLaunch: { author: true, projectLaunchInvestments: true, approver: true },
        },
      });
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: IUpdateProjectDto): Promise<Project> {
    try {
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

      return await AppDataSource.getRepository(Project).findOneOrFail({
        relations: {
          projectLaunch: { author: true, projectLaunchInvestments: true, approver: true },
          dataAccount: true,
          milestones: true,
          userToProjects: { project: true },
        },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the project. The project with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<Project> {
    try {
      const project = await AppDataSource.getRepository(Project).findOneOrFail({
        relations: {
          projectLaunch: { author: true, projectLaunchInvestments: true, approver: true },
          dataAccount: true,
          milestones: true,
          userToProjects: { project: true },
        },
        where: { id },
      });

      await AppDataSource.getRepository(Project).remove(structuredClone(project));

      return project;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the project. The project with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async prepareNftMetadata(project: any) {
    try {
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
    } catch (error: any) {
      throw new ServerException('Internal server error', error);
    }
  }
}

export default new ProjectService();
