import express from 'express';
import * as userController from './user.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/users', auth(), userController.findMany);
router.get('/users/:id', auth(), userController.findOne);
router.post('/users', auth(), userController.create);
router.put('/users/:id', auth(), userController.update);
router.delete('/users/:id', auth(), userController.remove);

export default router;
