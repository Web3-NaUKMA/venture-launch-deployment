import { Request, Response } from 'express';
import * as dataAccountService from './data-account.service';
import { HttpStatusCode } from 'axios';
import { IFindDataAccountDto } from '../../DTO/data-account.dto';

export const findMany = async (request: Request, response: Response) => {
  try {
    const dataAccounts = await dataAccountService.findMany(request.query as IFindDataAccountDto);
    return response.status(HttpStatusCode.Ok).json(dataAccounts);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const findOne = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const dataAccount = await dataAccountService.findOne({
      ...(request.query as IFindDataAccountDto),
      id,
    });

    if (!dataAccount) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The data account with such id was not found.' });
    }

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const create = async (request: Request, response: Response) => {
  try {
    const dataAccount = await dataAccountService.create(request.body);
    return response.status(HttpStatusCode.Created).json(dataAccount);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const update = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const dataAccountToUpdate = await dataAccountService.findOne({ id });

    if (!dataAccountToUpdate) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The data account with such id was not found.' });
    }

    const dataAccount = await dataAccountService.update(id, request.body);
    return response.status(HttpStatusCode.Ok).json(dataAccount);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};

export const remove = async (request: Request, response: Response) => {
  try {
    const { id } = request.params as any;
    const dataAccountToRemove = await dataAccountService.findOne({ id });

    if (!dataAccountToRemove) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: 'The data account with such id was not found.' });
    }

    const dataAccount = await dataAccountService.remove(id);
    return response.status(HttpStatusCode.Ok).json(dataAccount);
  } catch (error) {
    return response
      .status(HttpStatusCode.InternalServerError)
      .json({ message: 'Internal server error.' });
  }
};
