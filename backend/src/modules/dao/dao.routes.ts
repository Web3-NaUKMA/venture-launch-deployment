import express, { Request } from 'express';
import { auth } from '../../middleware/auth.middleware';
import multer from 'multer';
import { storage } from '../../utils/core/multer.config';
import daoController from './dao.controller';

const router = express.Router();
router.get('/dao/:id', auth(), daoController.findOne);

export default router;
