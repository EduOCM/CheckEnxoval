import model from '../models/produtos.model.js';
import { createProdutoSchema, patchProdutoSchema } from '../validators/produtos.schema.js';

export async function list(req, res) {
  res.json(model.list());
}

export async function create(req, res, next) {
  try {
    const data = createProdutoSchema.parse(req.body);
    const novo = model.create(data);
    res.status(201).json(novo);
  } catch (err) { next(err); }
}

export async function patch(req, res, next) {
  try {
    const id = Number(req.params.id);
    const fields = patchProdutoSchema.parse(req.body);
    const updated = model.patch(id, fields);
    if (!updated) return res.status(404).json({ error: 'não encontrado' });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const ok = model.remove(id);
    res.status(ok ? 204 : 404).end();
  } catch (err) { next(err); }
}
