import { Request, Response } from 'express';
import * as projectService from './project.service';
import { HttpStatusCode } from 'axios';
import { IFindProjectDto } from '../../DTO/project.dto';

export const findMany = async (request: Request, response: Response) => {
  try {
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
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const findOne = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const project = await projectService.findOne(
      { ...(request.query as IFindProjectDto), id },
      {
        milestones: {
          createdAt: 'DESC',
        },
      },
    );

    if (!project) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The project with such id was not found.' });
    }

    return response.status(HttpStatusCode.Ok).json(project);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const create = async (request: Request, response: Response) => {
  try {
    const project = await projectService.create(request.body);
    return response.status(HttpStatusCode.Created).json(project);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const update = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const projectToUpdate = await projectService.findOne({ id });

    if (!projectToUpdate) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The project with such id was not found.' });
    }

    const project = await projectService.update(id, request.body);
    return response.status(HttpStatusCode.Ok).json(project);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const remove = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const projectToRemove = await projectService.findOne({ id });

    if (!projectToRemove) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The project with such id was not found.' });
    }

    const project = await projectService.remove(id);
    return response.status(HttpStatusCode.Ok).json(project);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const prepareNftMetadata = async (request: Request, response: Response) => {
  try {
    const ipfsURL = await projectService.prepareNftMetadata(request.body);
    return response.status(HttpStatusCode.Created).json({ ipfsURL });
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error' });
  }
};
