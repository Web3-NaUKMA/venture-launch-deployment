import { Request, Response } from 'express';
import projectService from './project.service';
import { HttpStatusCode } from 'axios';
import { IFindProjectDto } from '../../DTO/project.dto';
import { Controller } from '../../decorators/app.decorators';

@Controller()
export class ProjectController {
  async findMany(request: Request, response: Response) {
    const { ownerId, memberId } = request.query;

    let query: IFindProjectDto = {};

    if (ownerId) query.projectLaunch = { author: { id: ownerId.toString() } };
    if (memberId) query.userToProjects = { userId: memberId as string };

    const projects = await projectService.findMany(query, {
      createdAt: 'DESC',
      milestones: {
        createdAt: 'DESC',
      },
    });

    return response.status(HttpStatusCode.Ok).json(projects);
  }

  async findOne(request: Request, response: Response) {
    const { id } = request.params as any;
    const project = await projectService.findOne(
      { ...(request.query as IFindProjectDto), id },
      {
        milestones: {
          createdAt: 'DESC',
        },
      },
    );

    return response.status(HttpStatusCode.Ok).json(project);
  }

  async create(request: Request, response: Response) {
    const project = await projectService.create(request.body);

    return response.status(HttpStatusCode.Created).json(project);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await projectService.findOne({ id });
    const project = await projectService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(project);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await projectService.findOne({ id });
    const project = await projectService.remove(id);

    return response.status(HttpStatusCode.Ok).json(project);
  }

  async prepareNftMetadata(request: Request, response: Response) {
    const ipfsURL = await projectService.prepareNftMetadata(request.body);

    return response.status(HttpStatusCode.Created).json({ ipfsURL });
  }
}

export default new ProjectController();
