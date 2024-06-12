import { Request, Response } from 'express';
import userService from './user.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { deleteFolder, uploadMultipleFiles } from '../../utils/file.utils';

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
    const { avatar: currentAvatar } = await userService.findOne({ id });

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
      path: `/uploads/users/${id}/${file.fieldname}`,
    }));

    if (files.length > 0) {
      await deleteFolder(`uploads/users/${id}`);
    }

    await uploadMultipleFiles(files);

    const avatar = files.find(file => file.fieldname === 'user-avatar');

    let data = { ...request.body };

    if (files.length > 0)
      data = {
        ...data,
        avatar: avatar
          ? `/uploads/users/${id}/${avatar.fieldname}/${avatar.originalname}`
          : request.body.avatar === null
            ? null
            : currentAvatar,
      };

    const user = await userService.update(id, data);

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
