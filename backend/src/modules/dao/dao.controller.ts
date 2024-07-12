import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { HttpStatusCode } from 'axios';
import daoService from './dao.service';
import { ChangeThresholdDto } from '../../DTO/dao.dto';

@Controller()
export class DAOController {
  async findOne(request: Request, response: Response) {
    await daoService.findOne();
    return response.status(HttpStatusCode.Ok).json('heh');
  }
  async create(request: Request, response: Response) {
    await daoService.create(request.body);
    return response.status(HttpStatusCode.Ok).json('created');
  }

  async addMember(request: Request, response: Response) {
    await daoService.addMember(request.body);
    return response.status(HttpStatusCode.Ok).json('added');
  }

  async removeMember(request: Request, response: Response) {
    await daoService.removeMember(request.body);
    return response.status(HttpStatusCode.Ok).json('removed');
  }

  async withdraw(request: Request, response: Response) {
    await daoService.withdraw(request.body);
    return response.status(HttpStatusCode.Ok).json('received');
  }

  async executeProposal(request: Request, response: Response) {
    await daoService.executeProposal(request.body);
    return response.status(HttpStatusCode.Ok).json('proposed');
  }

  async vote(request: Request, response: Response) {
    await daoService.vote(request.body);
    return response.status(HttpStatusCode.Ok).json('voted');
  }

  async changeThreshold(request: Request, response: Response) {
    await daoService.changeThreshold(request.body);
    return response.status(HttpStatusCode.Ok).json('threshold changed');
  }
}

export default new DAOController();
