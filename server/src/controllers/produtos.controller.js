// server/src/controllers/produtos.controller.js
import * as model from '../models/produtos.model.js';

const toCentavos = (reais) => Math.round(Number(reais || 0) * 100);
const fromCentavos = (c) => Number(c || 0) / 100;

export async function list(req, res, next) {
  try {
    const rows = model.findAll().map(r => ({ ...r, preco: fromCentavos(r.preco_centavos) }));
    res.json(rows);
  } catch (e) { next(e); }
}

export async function get(req, res, next) {
  try {
    const r = model.findById(Number(req.params.id));
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json({ ...r, preco: fromCentavos(r.preco_centavos) });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { nome, preco, descricao, categoria } = req.body;
    if (!nome) return res.status(400).json({ message: 'nome é obrigatório' });
    const novo = model.create({
      nome,
      preco_centavos: toCentavos(preco),
      descricao: descricao ?? null,
      categoria: categoria ?? null,
    });
    res.status(201).json({ ...novo, preco: fromCentavos(novo.preco_centavos) });
  } catch (e) { next(e); }
}

export async function patch(req, res, next) {
  try {
    const { nome, preco, descricao, categoria } = req.body;
    const updated = model.update(Number(req.params.id), {
      nome,
      preco_centavos: (preco !== undefined ? toCentavos(preco) : undefined),
      descricao,
      categoria,
    });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ ...updated, preco: fromCentavos(updated.preco_centavos) });
  } catch (e) { next(e); }
}

export async function del(req, res, next) {
  try {
    const ok = model.remove(Number(req.params.id));
    res.status(ok ? 204 : 404).end();
  } catch (e) { next(e); }
}
