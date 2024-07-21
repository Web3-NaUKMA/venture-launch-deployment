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
import { CommandType } from '../../utils/dao.utils';
import { rabbitMQ } from '../../utils/rabbitmq.utils';
import { DaoEntity } from '../../typeorm/entities/dao.entity';
import AppDataSource from '../../typeorm/index.typeorm';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';
import { UserEntity } from '../../typeorm/entities/user.entity';
import { COMMAND_TYPE } from '../../utils/command_type.enum';

export class DAOService {
  async findOne() {
    rabbitMQ.publish('request_exchange', {project_id: "5"}, 'unknown');
    // rabbitMQ.receive(
    //   'request.rs',
    //   'request_exchange',
    //   (message: unknown, error: any) => {
    //     console.log(message);
    //     console.log(error);
    //   },
    // );
  }

  async create(dao: CreateDAODto){
    rabbitMQ.publish('request_exchange', dao, COMMAND_TYPE.CREATE_DAO);

    rabbitMQ.receive(
      "response_exchange",
      "response_exchange",
      (message: unknown, error: any) => {
            console.log(message);
            console.log(error);
          },
    );
  }

  async addMember(memberDto: AddMemberDto) {
    console.log('project ', memberDto.project_id);
    console.log('adding ', memberDto.pubkey);
    rabbitMQ.publish('request_exchange', memberDto, COMMAND_TYPE.ADD_MEMBER);

    rabbitMQ.receive(
      "response_exchange",
      "response_exchange",
      (message: unknown, error: any) => {
            console.log(message);
            console.log(error);
          },
    );
  }

  async removeMember(memberDto: RemoveMemberDto) {
    console.log('project ', memberDto.project_id);
    console.log('removing ', memberDto.pubkey);
    rabbitMQ.publish('request_exchange', memberDto, COMMAND_TYPE.REMOVE_MEMBER);
  }

  async withdraw(withdrawDto: WithdrawDto) {
    console.log('project ', withdrawDto.project_id);
    console.log('receiver ', withdrawDto.receiver);
    rabbitMQ.publish('request_exchange', withdrawDto, COMMAND_TYPE.WITHDRAW);
  }

  async executeProposal(proposal: BlockchainExecuteProposalDto) {
    console.log('project ', proposal.multisig_pda);
    rabbitMQ.publish('request_exchange', proposal, CommandType.ProposalExecute);
  }

  async vote(vote: BlockchainVoteDto) {
    console.log('project ', vote.multisig_pda);
    console.log('voting ', vote.vote);
    rabbitMQ.publish('request_exchange', vote, CommandType.Vote);
  }

  async changeThreshold(threshold: BlockchainChangeThresholdDto) {
    console.log('project ', threshold.multisig_pda);
    rabbitMQ.publish('request_exchange', threshold, CommandType.ChangeThreshold);
  }
}

export default new DAOService();
