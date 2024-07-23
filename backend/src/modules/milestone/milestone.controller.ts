import { Request, Response } from 'express';
import milestoneService from './milestone.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';
import { CommandType } from '../../utils/dao.utils';
import proposalService from '../proposal/proposal.service';
import { rabbitMQ } from '../../utils/rabbitmq.utils';

@Controller()
export class MilestoneController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const milestones = await milestoneService.findMany({
      order: {
        createdAt: 'DESC',
      },
      ...query,
    });

    return response.status(HttpStatusCode.Ok).json(milestones);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const { id } = request.params as any;
    const milestone = await milestoneService.findOne(_.merge(query, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async create(request: Request, response: Response) {
    const milestone = await milestoneService.create(request.body);

    return response.status(HttpStatusCode.Created).json(milestone);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await milestoneService.findOne({ where: { id } });
    const milestone = await milestoneService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await milestoneService.findOne({ where: { id } });
    const milestone = await milestoneService.remove(id);

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async handleProposal(request: Request, response: Response) {
    const { id } = request.params;
    const { commandType, authorId, data } = request.body;

    if (Object.entries(CommandType).find(([_, value]) => value === commandType) && id) {
      const milestone = await milestoneService.findOne({ where: { id } });

      const proposal = await proposalService.create({
        milestone: { id },
        description: milestone.description,
        type: CommandType.Withdraw,
        author: { id: authorId },
      });

      rabbitMQ.publish('request_exchange', { ...data, proposal_id: proposal.id }, commandType);

      return response.status(HttpStatusCode.Created).json(proposal);
    }

    return response
      .status(HttpStatusCode.Conflict)
      .json({ message: 'Invalid command type was provided', body: request.body });
  }
}

export default new MilestoneController();
