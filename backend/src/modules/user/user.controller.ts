import { Request, Response } from 'express';
import * as userService from './user.service';
import { HttpStatusCode } from 'axios';

export const findMany = async (request: Request, response: Response) => {
  try {
    let parsedQuery: any = {};
    const { birthDate, createdAt, role, ...query } = request.query;
    if (birthDate) parsedQuery.birthDate = new Date(birthDate as string);
    if (createdAt) parsedQuery.createdAt = new Date(createdAt as string);
    if (role) parsedQuery.role = (role as string).split(/,\s*/);

    const users = await userService.findMany({ ...query, ...parsedQuery });
    return response.status(HttpStatusCode.Ok).json(users);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const findOne = async (request: Request, response: Response) => {
  try {
    let parsedQuery: any = {};
    const { birthDate, createdAt, role, ...query } = request.query;
    if (birthDate) parsedQuery.birthDate = new Date(birthDate as string);
    if (createdAt) parsedQuery.createdAt = new Date(createdAt as string);
    if (role) parsedQuery.role = (role as string).split(/,\s*/);

    const { id } = request.params;
    const user = await userService.findOne({ ...query, ...parsedQuery, id });

    if (!user) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The user with such id was not found.' });
    }

    return response.status(HttpStatusCode.Ok).json(user);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const create = async (request: Request, response: Response) => {
  try {
    const user = await userService.create(request.body);
    return response.status(HttpStatusCode.Created).json(user);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const update = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const userToUpdate = await userService.findOne({ id });

    if (!userToUpdate) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The user with such id was not found.' });
    }

    const user = await userService.update(id, request.body);
    return response.status(HttpStatusCode.Ok).json(user);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const remove = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const userToRemove = await userService.findOne({ id });

    if (!userToRemove) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The user with such id was not found.' });
    }

    const user = await userService.remove(id);
    return response.status(HttpStatusCode.Ok).json(user);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};
