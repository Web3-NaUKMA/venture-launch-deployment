import { Request, Response } from 'express';
import userService from './user.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';

@Controller()
export class UserController {
  async findMany(request: Request, response: Response) {
    let parsedQuery: any = {};
    const { birthDate, createdAt, role, ...query } = request.query;

    if (birthDate) parsedQuery.birthDate = new Date(birthDate as string);
    if (createdAt) parsedQuery.createdAt = new Date(createdAt as string);
    if (role) parsedQuery.role = (role as string).split(/,\s*/);

    const users = await userService.findMany({ ...query, ...parsedQuery });
    return response.status(HttpStatusCode.Ok).json(users);
  }

  async findOne(request: Request, response: Response) {
    let parsedQuery: any = {};
    const { birthDate, createdAt, role, ...query } = request.query;

    if (birthDate) parsedQuery.birthDate = new Date(birthDate as string);
    if (createdAt) parsedQuery.createdAt = new Date(createdAt as string);
    if (role) parsedQuery.role = (role as string).split(/,\s*/);

    const { id } = request.params;
    const user = await userService.findOne({ ...query, ...parsedQuery, id });

    return response.status(HttpStatusCode.Ok).json(user);
  }

  async create(request: Request, response: Response) {
    const user = await userService.create(request.body);

    return response.status(HttpStatusCode.Created).json(user);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await userService.findOne({ id });
    const user = await userService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(user);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await userService.findOne({ id });
    const user = await userService.remove(id);

    return response.status(HttpStatusCode.Ok).json(user);
  }
}

export default new UserController();
