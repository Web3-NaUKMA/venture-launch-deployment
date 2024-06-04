import { Request, Response } from 'express';
import path from 'path';
import { Controller } from '../../decorators/app.decorators';
import { ForbiddenException } from '../../utils/exceptions/exceptions.utils';

@Controller()
export class FileController {
  async getFile(request: Request, response: Response) {
    if (
      ['../', '..\\', './', '.\\', '~/', '~\\'].find(item =>
        (request.query.file ?? '').toString().includes(item),
      )
    ) {
      throw new ForbiddenException('This action is forbidden to perform');
    }

    const file = path.join(`./src/public/`, request.query.file?.toString() ?? '');
    return response.download(file);
  }
}

export default new FileController();
