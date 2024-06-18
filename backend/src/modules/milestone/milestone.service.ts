import AppDataSource from '../../typeorm/index.typeorm';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../../DTO/milestone.dto';
import { MilestoneEntity } from '../../typeorm/entities/milestone.entity';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';

export class MilestoneService {
  async findMany(options?: FindManyOptions<MilestoneEntity>): Promise<MilestoneEntity[]> {
    try {
      return await AppDataSource.getRepository(MilestoneEntity).find(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<MilestoneEntity>): Promise<MilestoneEntity> {
    try {
      return await AppDataSource.getRepository(MilestoneEntity).findOneOrFail(
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

  async create(data: CreateMilestoneDto): Promise<MilestoneEntity> {
    try {
      return await AppDataSource.getRepository(MilestoneEntity).save({
        ...data,
        project: { id: data.projectId },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateMilestoneDto): Promise<MilestoneEntity> {
    try {
      await AppDataSource.getRepository(MilestoneEntity).update({ id }, data);

      return await AppDataSource.getRepository(MilestoneEntity).findOneOrFail({
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

  async remove(id: string): Promise<MilestoneEntity> {
    try {
      const milestone = await AppDataSource.getRepository(MilestoneEntity).findOneOrFail({
        relations: { project: true },
        where: { id },
      });

      await AppDataSource.getRepository(MilestoneEntity).remove(structuredClone(milestone));

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
