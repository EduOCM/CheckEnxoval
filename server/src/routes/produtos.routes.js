import { Router } from 'express';
import * as ctrl from '../controllers/produtos.controller.js';
const router = Router();
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.patch);
router.delete('/:id', ctrl.del);

export default router;
