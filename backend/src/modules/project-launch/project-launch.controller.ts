import { Request, Response } from 'express';
import * as projectLaunchService from './project-launch.service';
import { HttpStatusCode } from 'axios';
import { deleteFolder, uploadMultipleFiles } from '../../utils/file.utils';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { IFindProjectLaunchDto } from '../../DTO/project-launch.dto';

export const findMany = async (request: Request, response: Response) => {
  try {
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
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const findOne = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const projectLaunch = await projectLaunchService.findOne({ ...request.query, id });

    if (!projectLaunch) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The project launch with such id was not found.' });
    }

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const create = async (request: Request, response: Response) => {
  try {
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

    team = team.map((member: any, index: number) => ({
      ...member,
      image: files[index] ? `${files[index].path}/${files[index].originalname}` : null,
    }));

    const projectDocuments = files
      .filter(file => file.fieldname === 'project-documents')
      .map(file => `${file.path}/${file.originalname}`);

    await uploadMultipleFiles(files);

    const projectLaunch = await projectLaunchService.update(createdProjectLaunch.id, {
      team,
      projectDocuments,
    });

    console.log(projectLaunch);

    return response.status(HttpStatusCode.Created).json(projectLaunch);
  } catch (error) {
    console.log(error);
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const update = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
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
      team = team.map((member: any, index: number) => ({
        ...member,
        image: files[index] ? `${files[index].path}/${files[index].originalname}` : null,
      }));
    }

    const projectDocuments = files
      .filter(file => file.fieldname === 'project-documents')
      .map(file => `${file.path}/${file.originalname}`);

    if (files.length > 0) {
      await deleteFolder(`uploads/project-launches/${id}`);
    }
    await uploadMultipleFiles(files);

    const projectLaunchToUpdate = await projectLaunchService.findOne({ id });

    if (!projectLaunchToUpdate) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The project launch with such id was not found.' });
    }

    let data = { ...request.body };
    if (team) data = { ...data, team };
    if (files.length > 0) data = { ...data, projectDocuments };

    const projectLaunch = await projectLaunchService.update(id, data);

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  } catch (error) {
    console.log(error);
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const remove = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const projectLaunchToRemove = await projectLaunchService.findOne({ id });

    if (!projectLaunchToRemove) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The project launch with such id was not found.' });
    }

    await deleteFolder(`uploads/project-launches/${id}`);

    const projectLaunch = await projectLaunchService.remove(id);
    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  } catch (error) {
    console.log(error);
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const createInvestor = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const projectLaunchInvestment = await projectLaunchService.createInvestment(id, request.body);
    return response.status(HttpStatusCode.Created).json(projectLaunchInvestment);
  } catch (error) {
    console.log(error);
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const updateInvestor = async (request: Request, response: Response) => {
  try {
    const { id, investorId } = request.params;
    const projectLaunchInvestment = await projectLaunchService.updateInvestment(
      id,
      investorId,
      request.body,
    );
    return response.status(HttpStatusCode.Created).json(projectLaunchInvestment);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};
