// server/src/controllers/produtos.controller.js
import model from '../models/produtos.model.js';
import { createProdutoSchema, patchProdutoSchema } from '../validators/produtos.schema.js';

export async function list(req, res, next) {
  try {
    const itens = model.list();
    res.json(itens);
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    const item = model.get(id);
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch (err) { next(err); }
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
    const atualizado = model.patch(id, fields);
    if (!atualizado) return res.status(404).json({ error: 'Não encontrado' });
    res.json(atualizado);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const ok = model.remove(id);
    if (!ok) return res.status(404).json({ error: 'Não encontrado' });
    res.status(204).end();
  } catch (err) { next(err); }
}
