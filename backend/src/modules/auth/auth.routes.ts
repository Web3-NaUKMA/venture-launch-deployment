import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import authController from './auth.controller';

const router = express.Router();

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/logout', authController.logout);
router.get('/auth/user', auth(), authController.user);

export default router;
