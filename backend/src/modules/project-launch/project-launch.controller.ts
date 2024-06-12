import { Request, Response } from 'express';
import projectLaunchService from './project-launch.service';
import { HttpStatusCode } from 'axios';
import { deleteFolder, uploadMultipleFiles } from '../../utils/file.utils';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { IFindProjectLaunchDto } from '../../DTO/project-launch.dto';
import { Controller } from '../../decorators/app.decorators';

@Controller()
export class ProjectLaunchController {
  async findMany(request: Request, response: Response) {
    const { ownerId, memberId, investorId, ...otherQueryParams } = request.query;
    let query: IFindProjectLaunchDto = {};

    if (ownerId) query.author = { id: ownerId.toString() };
    if (memberId) query.project = { userToProjects: { userId: memberId as string } };
    if (investorId) query.projectLaunchInvestments = { investor: { id: investorId as string } };

    query = { ...query, ...otherQueryParams };

    const projectLaunches = await projectLaunchService.findMany(query, {
      createdAt: 'DESC',
    });

    return response.status(HttpStatusCode.Ok).json(projectLaunches);
  }

  async findOne(request: Request, response: Response) {
    const { id } = request.params;
    const projectLaunch = await projectLaunchService.findOne({ ...request.query, id });

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  }

  async create(request: Request, response: Response) {
    let team = JSON.parse(request.body.team);
    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const createdProjectLaunch = await projectLaunchService.create(request.body);

    files = files.map(file => ({
      ...file,
      originalname: `${uuid()}${path.extname(file.originalname)}`,
      path: `/uploads/project-launches/${createdProjectLaunch.id}/${file.fieldname}`,
    }));

    const teamFiles = files.filter(file => file.fieldname === 'team-images');

    team = team.map((member: any, index: number) => ({
      ...member,
      image: teamFiles[index] ? `${teamFiles[index].path}/${teamFiles[index].originalname}` : null,
    }));

    const logoFile = files.find(file => file.fieldname === 'project-logo') ?? null;

    const projectDocuments = files
      .filter(file => file.fieldname === 'project-documents')
      .map(file => `${file.path}/${file.originalname}`);

    await uploadMultipleFiles(files);

    const projectLaunch = await projectLaunchService.update(createdProjectLaunch.id, {
      team,
      projectDocuments,
      logo: logoFile
        ? `/uploads/project-launches/${createdProjectLaunch.id}/${logoFile.fieldname}/${logoFile.originalname}`
        : null,
    });

    return response.status(HttpStatusCode.Created).json(projectLaunch);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    await projectLaunchService.findOne({ id });

    let team = request.body.team ? JSON.parse(request.body.team) : undefined;
    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    files = files.map(file => ({
      ...file,
      originalname: `${uuid()}${path.extname(file.originalname)}`,
      path: `/uploads/project-launches/${id}/${file.fieldname}`,
    }));

    if (team) {
      const teamFiles = files.filter(file => file.fieldname === 'team-images');

      team = team.map((member: any, index: number) => ({
        ...member,
        image: teamFiles[index]
          ? `${teamFiles[index].path}/${teamFiles[index].originalname}`
          : null,
      }));
    }

    const projectDocuments = files
      .filter(file => file.fieldname === 'project-documents')
      .map(file => `${file.path}/${file.originalname}`);

    if (files.length > 0) {
      await deleteFolder(`uploads/project-launches/${id}`);
    }

    await uploadMultipleFiles(files);

    const logoFile = files.find(file => file.fieldname === 'project-logo') ?? null;

    let data = { ...request.body };

    if (team) data = { ...data, team };
    if (files.length > 0)
      data = {
        ...data,
        projectDocuments,
        logo: logoFile
          ? `/uploads/project-launches/${id}/${logoFile.fieldname}/${logoFile.originalname}`
          : null,
      };

    const projectLaunch = await projectLaunchService.update(id, data);

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await projectLaunchService.findOne({ id });
    await deleteFolder(`uploads/project-launches/${id}`);
    const projectLaunch = await projectLaunchService.remove(id);

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  }

  async createInvestor(request: Request, response: Response) {
    const { id } = request.params;
    const projectLaunchInvestment = await projectLaunchService.createInvestment(id, request.body);

    return response.status(HttpStatusCode.Created).json(projectLaunchInvestment);
  }

  async updateInvestor(request: Request, response: Response) {
    const { id, investorId } = request.params;
    const projectLaunchInvestment = await projectLaunchService.updateInvestment(
      id,
      investorId,
      request.body,
    );

    return response.status(HttpStatusCode.Created).json(projectLaunchInvestment);
  }
}

export default new ProjectLaunchController();
