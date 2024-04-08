import { Request, Response } from 'express';
import * as milestoneService from './milestone.service';
import { HttpStatusCode } from 'axios';
import { IFindMilestoneDto } from '../../DTO/milestone.dto';

export const findMany = async (request: Request, response: Response) => {
  try {
    const milestones = await milestoneService.findMany(request.query as IFindMilestoneDto, {
      createdAt: 'DESC',
    });
    return response.status(HttpStatusCode.Ok).json(milestones);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const findOne = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const milestone = await milestoneService.findOne({
      ...(request.query as IFindMilestoneDto),
      id,
    });

    if (!milestone) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The milestone with such id was not found.' });
    }

    return response.status(HttpStatusCode.Ok).json(milestone);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const create = async (request: Request, response: Response) => {
  try {
    const milestone = await milestoneService.create(request.body);
    return response.status(HttpStatusCode.Created).json(milestone);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const update = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const milestoneToUpdate = await milestoneService.findOne({ id });

    if (!milestoneToUpdate) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The milestone with such id was not found.' });
    }

    const milestone = await milestoneService.update(id, request.body);
    return response.status(HttpStatusCode.Ok).json(milestone);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const remove = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const milestoneToRemove = await milestoneService.findOne({ id });

    if (!milestoneToRemove) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The milestone with such id was not found.' });
    }

    const milestone = await milestoneService.remove(id);
    return response.status(HttpStatusCode.Ok).json(milestone);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};
