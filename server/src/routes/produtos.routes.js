import { Router } from 'express';
import { list, get, create, patch, remove } from '../controllers/produtos.controller.js';

const router = Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', get);
router.patch('/:id', patch);
router.delete('/:id', remove);

export default router;
