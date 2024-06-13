import AppDataSource from '../../typeorm/index.typeorm';
import { EntityNotFoundError, FindOptionsOrder } from 'typeorm';
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
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
} from '../../utils/exceptions/exceptions.utils';

export class ProjectLaunchService {
  async findMany(
    options: IFindProjectLaunchDto,
    order?: FindOptionsOrder<ProjectLaunch>,
  ): Promise<ProjectLaunch[]> {
    try {
      const formattedOptions = formatQueryOptions(options);

      return await AppDataSource.getRepository(ProjectLaunch).find({
        relations: {
          author: true,
          project: true,
          projectLaunchInvestments: true,
          approver: true,
        },
        where: formattedOptions,
        order,
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(
    options: IFindProjectLaunchDto,
    order?: FindOptionsOrder<ProjectLaunch>,
  ): Promise<ProjectLaunch> {
    try {
      const formattedOptions = formatQueryOptions(options);

      return await AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
        relations: {
          author: true,
          project: true,
          projectLaunchInvestments: true,
          approver: true,
        },
        where: formattedOptions,
        order,
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The project launch with provided data does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: ICreateProjectLaunchDto): Promise<ProjectLaunch> {
    try {
      const exists = await AppDataSource.getRepository(ProjectLaunch).exists({
        where: {
          name: data.name,
          author: { id: data.authorId },
        },
      });

      if (exists) {
        throw new ConflictException('The record with such name already exists.');
      }

      const projectLaunch = await AppDataSource.getRepository(ProjectLaunch).save({
        ...data,
        author: { id: data.authorId },
      });

      return await AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
        where: { id: projectLaunch.id },
        relations: { author: true, project: true },
      });
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: IUpdateProjectLaunchDto): Promise<ProjectLaunch> {
    try {
      const { approverId } = data;
      delete data.approverId;

      await AppDataSource.getRepository(ProjectLaunch).update(
        { id },
        {
          ...data,
          ...(approverId ? { approver: { id: approverId } } : {}),
        },
      );

      return await AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
        relations: {
          author: true,
          project: true,
          approver: true,
        },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the project launch. The project launch with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<ProjectLaunch> {
    try {
      const projectLaunch = await AppDataSource.getRepository(ProjectLaunch).findOneOrFail({
        relations: {
          author: true,
          project: true,
          approver: true,
        },
        where: { id },
      });

      await AppDataSource.getRepository(ProjectLaunch).remove(structuredClone(projectLaunch));
      return projectLaunch;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the project launch. The project launch with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async createInvestment(
    id: string,
    data: ICreateProjectLaunchInvestmentDto,
  ): Promise<ProjectLaunchInvestment> {
    try {
      const projectLaunchInvestment = await AppDataSource.getRepository(
        ProjectLaunchInvestment,
      ).save({
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

      return await AppDataSource.getRepository(ProjectLaunchInvestment).findOneOrFail({
        where: { id: projectLaunchInvestment.id },
        relations: { investor: true, projectLaunch: true },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot create project launch investment. The project launch with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async updateInvestment(
    id: string,
    investorId: string,
    data: IUpdateProjectLaunchInvestmentDto,
  ): Promise<ProjectLaunchInvestment> {
    try {
      await AppDataSource.getRepository(ProjectLaunchInvestment).update(
        { projectLaunch: { id }, investor: { id: investorId } },
        data,
      );

      return await AppDataSource.getRepository(ProjectLaunchInvestment).findOneOrFail({
        relations: {
          investor: true,
          projectLaunch: true,
        },
        where: { projectLaunch: { id }, investor: { id: investorId } },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update project launch investment. The investment with such id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new ProjectLaunchService();
