import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import {
  CreateDaoDto,
  UpdateDaoDto,
  DaoMemberDto,
  BlockchainAddMemberDto,
  BlockchainRemoveMemberDto,
  BlockchainCreateDaoDto,
  BlockchainWithdrawDto,
  BlockchainExecuteProposalDto,
  BlockchainVoteDto,
  BlockchainChangeThresholdDto,
} from '../../DTO/dao.dto';
import { COMMAND_TYPE } from '../../utils/command_type.enum';
import { rabbitMQ } from '../../utils/rabbitmq.utils';
import { DaoEntity } from '../../typeorm/entities/dao.entity';
import AppDataSource from '../../typeorm/index.typeorm';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';
import { UserEntity } from '../../typeorm/entities/user.entity';

export class DAOService {
  async findMany(options?: FindManyOptions<DaoEntity>): Promise<DaoEntity[]> {
    try {
      return await AppDataSource.getRepository(DaoEntity).find(
        _.merge(options, {
          relations: { projectLaunch: true, members: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<DaoEntity>): Promise<DaoEntity> {
    try {
      let removedAt = (options?.where as any)?.messages?.removedAt;
      delete (options?.where as any)?.messages?.removedAt;

      if (!removedAt) removedAt = null;

      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail(
        _.merge(options, {
          relations: { projectLaunch: true, members: true },
        }),
      );

      return dao;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The dao with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateDaoDto): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).save(data);
      rabbitMQ.publish(
        'request_exchange',
        { project_id: data.projectLaunch.id } as BlockchainCreateDaoDto,
        COMMAND_TYPE.CREATE_DAO,
      );

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        where: { id: dao.id },
        relations: { projectLaunch: true, members: true },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateDaoDto): Promise<DaoEntity> {
    try {
      const { membersToAdd, membersToRemove, ...rest } = data;

      await AppDataSource.getRepository(DaoEntity).update(
        { id },
        { updatedAt: new Date(), ...rest },
      );

      if (membersToAdd) {
        await this.addMembersToDao(id, membersToAdd);
      }

      if (membersToRemove) {
        await this.removeMembersFromDao(id, membersToRemove);
      }

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the dao. The dao with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });

      await AppDataSource.getRepository(DaoEntity).remove(structuredClone(dao));

      return dao;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the dao. The dao with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async addMembersToDao(id: string, members: DaoMemberDto[]): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        where: { id },
        relations: { members: true, projectLaunch: { approver: true } },
      });

      rabbitMQ.publish(
        'request_exchange',
        {
          project_id: dao.projectLaunch.id,
          pubkey: dao.projectLaunch.approver.id,
        } as BlockchainAddMemberDto,
        COMMAND_TYPE.ADD_MEMBER,
      );

      const existingUsers = (
        (
          await Promise.allSettled(
            members.map(member =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: member.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => result.value);

      dao.members = existingUsers;

      await AppDataSource.getRepository(DaoEntity).save(dao);

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot add members to the dao. The dao or some of the members with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async removeMembersFromDao(id: string, members: DaoMemberDto[]): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        where: { id },
        relations: { members: true, projectLaunch: { approver: true } },
      });

      rabbitMQ.publish(
        'request_exchange',
        {
          project_id: dao.projectLaunch.id,
          pubkey: dao.projectLaunch.approver.id,
        } as BlockchainRemoveMemberDto,
        COMMAND_TYPE.REMOVE_MEMBER,
      );

      const existingUsers = (
        (
          await Promise.allSettled(
            members.map(member =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: member.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => result.value);

      dao.members = dao.members.filter(
        member => !existingUsers.find(user => user.id === member.id),
      );
      await AppDataSource.getRepository(DaoEntity).save(dao);

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove members from the dao. The dao with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  // async addMember(memberDto: AddMemberDto) {
  //   console.log('project ', memberDto.project_id);
  //   console.log('adding ', memberDto.pubkey);
  //   rabbitMQ.publish('request_exchange', memberDto, COMMAND_TYPE.ADD_MEMBER);
  // }

  // async removeMember(memberDto: RemoveMemberDto) {
  //   console.log('project ', memberDto.project_id);
  //   console.log('removing ', memberDto.pubkey);
  //   rabbitMQ.publish('request_exchange', memberDto, COMMAND_TYPE.REMOVE_MEMBER);
  // }

  async withdraw(withdrawDto: BlockchainWithdrawDto) {
    console.log('project ', withdrawDto.project_id);
    console.log('receiver ', withdrawDto.receiver);
    rabbitMQ.publish('request_exchange', withdrawDto, COMMAND_TYPE.WITHDRAW);
  }

  async executeProposal(proposal: BlockchainExecuteProposalDto) {
    console.log('project ', proposal.project_id);
    rabbitMQ.publish('request_exchange', proposal, COMMAND_TYPE.PROPOSAL_EXECUTE);
  }

  async vote(vote: BlockchainVoteDto) {
    console.log('project ', vote.project_id);
    console.log('voting ', vote.vote);
    rabbitMQ.publish('request_exchange', vote, COMMAND_TYPE.VOTE);
  }

  async changeThreshold(threshold: BlockchainChangeThresholdDto) {
    console.log('project ', threshold.project_id);
    rabbitMQ.publish('request_exchange', threshold, COMMAND_TYPE.CHANGE_THRESHOLD);
  }
}

export default new DAOService();
