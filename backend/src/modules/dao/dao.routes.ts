import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import daoController from './dao.controller';

const router = express.Router();
router.get('/dao/:id', auth(), daoController.findOne);

export default router;
