import { Request, Response } from 'express';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';

import { Controller } from '../../decorators/app.decorators';
import qs from 'qs';
import { HttpStatusCode } from 'axios';

@Controller()
export class DAOController {
    async findOne(request: Request, response: Response) {

        return response.status(HttpStatusCode.Ok).json('heh');
    }
}

export default new DAOController();
