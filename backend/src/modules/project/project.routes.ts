import express from 'express';
import projectController from './project.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/projects', auth(), projectController.findMany);
router.get('/projects/:id', auth(), projectController.findOne);
router.post('/projects/ipfs-url', auth(), projectController.prepareNftMetadata);
router.post('/projects', auth(), projectController.create);
router.put('/projects/:id', auth(), projectController.update);
router.delete('/projects/:id', auth(), projectController.remove);

export default router;
