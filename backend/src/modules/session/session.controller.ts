import { Request, Response } from 'express';
import sessionService from './session.service';
import { HttpStatusCode } from 'axios';
import { IFindSessionDto } from '../../DTO/session.dto';
import { Controller } from '../../decorators/app.decorators';

@Controller()
export class SessionController {
  async findMany(request: Request, response: Response) {
    const { sessionId, userId, expiresAt } = request.query as any;
    const filters: IFindSessionDto = { sessionId, expiresAt, user: { id: userId } };
    const sessions = await sessionService.findMany(filters);

    return response.status(HttpStatusCode.Ok).json(sessions);
  }

  async findOne(request: Request, response: Response) {
    const { sessionId, userId, expiresAt } = request.query as any;
    const { id } = request.params as any;
    const filters: IFindSessionDto = { sessionId, expiresAt, user: { id: userId } };
    const session = await sessionService.findOne({ ...filters, sessionId: id });

    return response.status(HttpStatusCode.Ok).json(session);
  }

  async create(request: Request, response: Response) {
    const session = await sessionService.create(request.body);

    return response.status(HttpStatusCode.Created).json(session);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await sessionService.findOne({ sessionId: id });
    const session = await sessionService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(session);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await sessionService.findOne({ sessionId: id });
    const session = await sessionService.remove(id);

    return response.status(HttpStatusCode.Ok).json(session);
  }
}

export default new SessionController();
