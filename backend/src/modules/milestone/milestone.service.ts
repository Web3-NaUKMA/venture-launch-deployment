import AppDataSource from '../../typeorm/index.typeorm';
import { ICreateMilestoneDto, IUpdateMilestoneDto } from '../../DTO/milestone.dto';
import { Milestone } from '../../typeorm/models/Milestone';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';

export class MilestoneService {
  async findMany(options?: FindManyOptions<Milestone>): Promise<Milestone[]> {
    try {
      return await AppDataSource.getRepository(Milestone).find(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<Milestone>): Promise<Milestone> {
    try {
      return await AppDataSource.getRepository(Milestone).findOneOrFail(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The milestone with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: ICreateMilestoneDto): Promise<Milestone> {
    try {
      return await AppDataSource.getRepository(Milestone).save({
        ...data,
        project: { id: data.projectId },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: IUpdateMilestoneDto): Promise<Milestone> {
    try {
      await AppDataSource.getRepository(Milestone).update({ id }, data);

      return await AppDataSource.getRepository(Milestone).findOneOrFail({
        relations: { project: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the milestone. The milestone with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<Milestone> {
    try {
      const milestone = await AppDataSource.getRepository(Milestone).findOneOrFail({
        relations: { project: true },
        where: { id },
      });

      await AppDataSource.getRepository(Milestone).remove(structuredClone(milestone));
      return milestone;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the milestone. The milestone with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new MilestoneService();
