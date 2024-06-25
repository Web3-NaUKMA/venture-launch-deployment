import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import chatService from './chat.service';
import { HttpStatusCode } from 'axios';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { deleteFolder, uploadMultipleFiles } from '../../utils/file.utils';

@Controller()
export class ChatController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const chats = await chatService.findMany({
      order: {
        messages: {
          createdAt: 'DESC',
        },
      },
      ...query,
    });

    return response.status(HttpStatusCode.Ok).json(chats);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params as any;
    const chat = await chatService.findOne(
      _.merge(query as any, { where: { id }, order: { messages: { createdAt: 'DESC' } } }),
    );

    return response.status(HttpStatusCode.Ok).json(chat);
  }

  async create(request: Request, response: Response) {
    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const createdChat = await chatService.create(request.body);

    files = files.map(file => ({
      ...file,
      originalname: `${uuid()}${path.extname(file.originalname)}`,
      path: `/uploads/chats/${createdChat.id}/${file.fieldname}`,
    }));

    const imageFile = files.find(file => file.fieldname === 'chat-image') ?? null;

    await uploadMultipleFiles(files);

    const chat = await chatService.update(createdChat.id, {
      image: imageFile
        ? `/uploads/chats/${createdChat.id}/${imageFile.fieldname}/${imageFile.originalname}`
        : null,
    });

    return response.status(HttpStatusCode.Created).json(chat);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    await chatService.findOne({ where: { id } });

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
      path: `/uploads/chats/${id}/${file.fieldname}`,
    }));

    if (files.length > 0) {
      await deleteFolder(`uploads/chats/${id}`);
    }

    await uploadMultipleFiles(files);

    const imageFile = files.find(file => file.fieldname === 'chat-image') ?? null;

    let data = { ...request.body };

    if (files.length > 0)
      data = {
        ...data,
        image: imageFile
          ? `/uploads/chats/${id}/${imageFile.fieldname}/${imageFile.originalname}`
          : null,
      };

    const chat = await chatService.update(id, data);

    return response.status(HttpStatusCode.Ok).json(chat);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await chatService.findOne({ where: { id } });
    await deleteFolder(`uploads/chats/${id}`);
    const chat = await chatService.remove(id);

    return response.status(HttpStatusCode.Ok).json(chat);
  }
}

export default new ChatController();
