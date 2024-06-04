import { Request, Response } from 'express';
import milestoneService from './milestone.service';
import { HttpStatusCode } from 'axios';
import { IFindMilestoneDto } from '../../DTO/milestone.dto';
import { Controller } from '../../decorators/app.decorators';

@Controller()
export class MilestoneController {
  async findMany(request: Request, response: Response) {
    const milestones = await milestoneService.findMany(request.query as IFindMilestoneDto, {
      createdAt: 'DESC',
    });

    return response.status(HttpStatusCode.Ok).json(milestones);
  }

  async findOne(request: Request, response: Response) {
    const { id } = request.params as any;
    const milestone = await milestoneService.findOne({
      ...(request.query as IFindMilestoneDto),
      id,
    });

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async create(request: Request, response: Response) {
    const milestone = await milestoneService.create(request.body);

    return response.status(HttpStatusCode.Created).json(milestone);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await milestoneService.findOne({ id });
    const milestone = await milestoneService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await milestoneService.findOne({ id });
    const milestone = await milestoneService.remove(id);

    return response.status(HttpStatusCode.Ok).json(milestone);
  }
}

export default new MilestoneController();
