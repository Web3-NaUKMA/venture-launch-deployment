import express from 'express';
import * as fileController from './file.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/file', auth(), fileController.getFile);

export default router;
