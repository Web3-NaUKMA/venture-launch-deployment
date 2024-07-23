import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { ProposalEntity } from '../../typeorm/entities/proposal.entity';
import AppDataSource from '../../typeorm/index.typeorm';
import _ from 'lodash';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import { CreateProposalDto, ProposalVoteDto, UpdateProposalDto } from '../../DTO/proposal.dto';
import { UserEntity } from '../../typeorm/entities/user.entity';
import { ProposalVoteEntity } from '../../typeorm/entities/proposal-vote.entity';
import { User } from '../../types/user.interface';
import { rabbitMQ } from '../../utils/rabbitmq.utils';
import { CommandType } from '../../utils/dao.utils';

export class ProposalService {
  async findMany(options?: FindManyOptions<ProposalEntity>): Promise<ProposalEntity[]> {
    try {
      return await AppDataSource.getRepository(ProposalEntity).find(
        _.merge(options, {
          relations: { project: true, author: true, votes: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<ProposalEntity>): Promise<ProposalEntity> {
    try {
      const proposal = await AppDataSource.getRepository(ProposalEntity).findOneOrFail(
        _.merge(options, {
          relations: { project: true, author: true, votes: true },
        }),
      );

      return proposal;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The proposal with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateProposalDto): Promise<ProposalEntity> {
    try {
      const proposal = await AppDataSource.getRepository(ProposalEntity).save(data);

      return await AppDataSource.getRepository(ProposalEntity).findOneOrFail({
        where: { id: proposal.id },
        relations: { project: true, author: true, votes: true },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateProposalDto): Promise<ProposalEntity> {
    try {
      const { votesToAdd, ...rest } = data;

      await AppDataSource.getRepository(ProposalEntity).update(
        { id },
        { updatedAt: new Date(), ...rest },
      );

      if (votesToAdd) {
        await this.addVotesToProposal(id, votesToAdd);
      }

      return await AppDataSource.getRepository(ProposalEntity).findOneOrFail({
        relations: { project: true, author: true, votes: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the proposal. The proposal with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<ProposalEntity> {
    try {
      const proposal = await AppDataSource.getRepository(ProposalEntity).findOneOrFail({
        relations: { project: true, author: true, votes: true },
        where: { id },
      });

      await AppDataSource.getRepository(ProposalEntity).remove(structuredClone(proposal));

      return proposal;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the proposal. The proposal with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async addVotesToProposal(id: string, votes: ProposalVoteDto[]): Promise<ProposalEntity> {
    try {
      const proposal = await AppDataSource.getRepository(ProposalEntity).findOneOrFail({
        where: { id },
        relations: {
          project: { projectLaunch: { dao: { members: true } } },
          author: true,
          votes: true,
        },
      });

      const votesToRegister = votes
        .filter(vote =>
          proposal.project.projectLaunch.dao.members.find(
            (member: User) => member.id === vote.memberId,
          ),
        )
        .map(vote => ({
          member: { id: vote.memberId },
          memberId: vote.memberId,
          decision: vote.decision,
          proposal: { id },
          proposalId: id,
        }));

      votesToRegister.forEach(voteToRegister => {
        const multisig_pda = proposal.project.projectLaunch.dao.multisigPda;
        const member = proposal.project.projectLaunch.dao.members.find(
          member => member.id === voteToRegister.memberId,
        );
        const vote = voteToRegister.decision;

        if (member) {
          const voter = member.walletId;
          rabbitMQ.publish('request_exchange', { multisig_pda, voter, vote }, CommandType.Vote);
        }
      });

      await AppDataSource.getRepository(ProposalVoteEntity).save(votesToRegister);

      return await AppDataSource.getRepository(ProposalEntity).findOneOrFail({
        relations: { project: true, author: true, votes: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot add votes to the proposal. The proposal or some of the votes with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new ProposalService();
