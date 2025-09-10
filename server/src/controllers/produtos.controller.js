import {
  listarProdutos, obterProduto, criarProduto, atualizarProduto, deletarProduto
} from '../models/produtos.model.js';
import { criarProdutoSchema, atualizarProdutoSchema } from '../validators/produtos.schema.js';

export function index(req, res) {
  const data = listarProdutos();
  res.json(data);
}
export function show(req, res) {
  const item = obterProduto(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(item);
}
export function store(req, res) {
  const parsed = criarProdutoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.flatten() });
  const created = criarProduto(parsed.data);
  res.status(201).json(created);
}
export function update(req, res) {
  const parsed = atualizarProdutoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.flatten() });
  const updated = atualizarProduto(Number(req.params.id), parsed.data);
  if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(updated);
}
export function destroy(req, res) {
  const ok = deletarProduto(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Produto não encontrado' });
  res.status(204).send();
}
