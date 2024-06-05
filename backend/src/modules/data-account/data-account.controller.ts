import { Request, Response } from 'express';
import dataAccountService from './data-account.service';
import { HttpStatusCode } from 'axios';
import { IFindDataAccountDto } from '../../DTO/data-account.dto';
import { Controller } from '../../decorators/app.decorators';

@Controller()
export class DataAccountController {
  async findMany(request: Request, response: Response) {
    const dataAccounts = await dataAccountService.findMany(request.query as IFindDataAccountDto);

    return response.status(HttpStatusCode.Ok).json(dataAccounts);
  }

  async findOne(request: Request, response: Response) {
    const { id } = request.params as any;
    const dataAccount = await dataAccountService.findOne({
      ...(request.query as IFindDataAccountDto),
      id,
    });

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  }

  async create(request: Request, response: Response) {
    const dataAccount = await dataAccountService.create(request.body);

    return response.status(HttpStatusCode.Created).json(dataAccount);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await dataAccountService.findOne({ id });
    const dataAccount = await dataAccountService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await dataAccountService.findOne({ id });
    const dataAccount = await dataAccountService.remove(id);

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  }
}

export default new DataAccountController();
