import express from 'express';
import * as authController from './auth.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/logout', authController.logout);
router.get('/auth/user', auth(), authController.user);

export default router;
