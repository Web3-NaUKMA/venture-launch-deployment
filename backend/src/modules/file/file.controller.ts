import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import path from 'path';

export const getFile = async (request: Request, response: Response) => {
  if (
    ['../', '..\\', './', '.\\', '~/', '~\\'].find(item =>
      (request.query.file ?? '').toString().includes(item),
    )
  ) {
    return response.status(HttpStatusCode.Forbidden).json({ message: 'This action is forbidden!' });
  }

  const file = path.join(`./src/public/`, request.query.file?.toString() ?? '');
  return response.download(file);
};
