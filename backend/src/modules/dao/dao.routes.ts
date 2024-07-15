import express from 'express';
import daoController from './dao.controller';

const router = express.Router();
router.post('/dao', daoController.create);
router.post('/dao/addMember', daoController.addMember);
router.post('/dao/removeMember', daoController.removeMember);
router.post('/dao/withdraw', daoController.withdraw);
router.post('/dao/executeProposal', daoController.executeProposal);
router.post('/dao/vote', daoController.vote);
router.post('/dao/changeThreshold', daoController.changeThreshold);

export default router;
