import { Request, Response } from 'express';
import * as sessionService from './session.service';
import { HttpStatusCode } from 'axios';
import { IFindSessionDto } from '../../DTO/session.dto';

export const findMany = async (request: Request, response: Response) => {
  try {
    const { sessionId, userId, expiresAt } = request.query as any;
    const filters: IFindSessionDto = { sessionId, expiresAt, user: { id: userId } };
    const sessions = await sessionService.findMany(filters);
    return response.status(HttpStatusCode.Ok).json(sessions);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const findOne = async (request: Request, response: Response) => {
  try {
    const { sessionId, userId, expiresAt } = request.query as any;
    const { id } = request.params as any;
    const filters: IFindSessionDto = { sessionId, expiresAt, user: { id: userId } };
    const session = await sessionService.findOne({ ...filters, sessionId: id });

    if (!session) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The session with such id was not found.' });
    }

    return response.status(HttpStatusCode.Ok).json(session);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const create = async (request: Request, response: Response) => {
  try {
    const session = await sessionService.create(request.body);
    return response.status(HttpStatusCode.Created).json(session);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const update = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const sessionToUpdate = await sessionService.findOne({ sessionId: id });

    if (!sessionToUpdate) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The session with such id was not found.' });
    }

    const session = await sessionService.update(id, request.body);
    return response.status(HttpStatusCode.Ok).json(session);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const remove = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const sessionToRemove = await sessionService.findOne({ sessionId: id });

    if (!sessionToRemove) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The session with such id was not found.' });
    }

    const session = await sessionService.remove(id);
    return response.status(HttpStatusCode.Ok).json(session);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};
