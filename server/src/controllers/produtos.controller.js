// server/src/controllers/produtos.controller.js
import model from '../models/produtos.model.js';

export async function list(req, res, next) {
  try {
    const rows = model.list();          // <- era findAll()
    res.json(rows);
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = model.get(id);
    if (!row) return res.status(404).json({ error: 'Não encontrado' });
    res.json(row);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const created = model.create(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

export async function patch(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = model.patch(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Não encontrado' });
    res.json(updated);
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
