import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { HttpStatusCode } from 'axios';
import daoService from './dao.service';

@Controller()
export class DAOController {
  async findOne(request: Request, response: Response) {
    await daoService.findOne();
    return response.status(HttpStatusCode.Ok).json('heh');
  }
}

export default new DAOController();
