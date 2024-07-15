import {
  AddMemberDto,
  CreateDAODto,
  ExecuteProposalDto,
  RemoveMemberDto,
  VoteDto,
  WithdrawDto,
  ChangeThresholdDto,
} from '../../DTO/dao.dto';
import { COMMAND_TYPE } from '../../utils/command_type.enum';
import { rabbitMQ } from '../../utils/rabbitmq.utils';

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

  async executeProposal(proposal: ExecuteProposalDto) {
    console.log('project ', proposal.project_id);
    rabbitMQ.publish('request_exchange', proposal, COMMAND_TYPE.PROPOSAL_EXECUTE);
  }

  async vote(vote: VoteDto) {
    console.log('project ', vote.project_id);
    console.log('voting ', vote.vote);
    rabbitMQ.publish('request_exchange', vote, COMMAND_TYPE.VOTE);
  }

  async changeThreshold(threshold: ChangeThresholdDto) {
    console.log('project ', threshold.project_id);
    rabbitMQ.publish('request_exchange', threshold, COMMAND_TYPE.CHANGE_THRESHOLD);
  }
}

export default new DAOService();
