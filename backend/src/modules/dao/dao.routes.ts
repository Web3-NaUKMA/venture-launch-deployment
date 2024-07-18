import express from 'express';
import daoController from './dao.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();
router.get('/daos', auth(), daoController.findMany);
router.get('/daos/:id', auth(), daoController.findOne);
router.post('/daos', auth(), daoController.create);
router.put('/daos/:id', auth(), daoController.update);
router.delete('/daos/:id', auth(), daoController.remove);
router.post('/daos', daoController.create);
// router.post('/daos/:id/members', daoController.addMember);
// router.delete('/daos/:id/members', daoController.removeMember);
router.post('/dao/withdraw', daoController.withdraw);
router.post('/dao/executeProposal', daoController.executeProposal);
router.post('/dao/vote', daoController.vote);
router.post('/dao/changeThreshold', daoController.changeThreshold);

export default router;
