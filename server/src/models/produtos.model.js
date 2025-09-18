// server/src/models/produtos.model.js
import db from '../db/connection.js';

const selectAll = db.prepare(`
  SELECT id, nome, categoria, orcamento, valorfinal, quantidade,
         link_referencia, link_compra, comprado, prioridade
  FROM produtos
  ORDER BY id DESC
`);

const selectById = db.prepare(`
  SELECT id, nome, categoria, orcamento, valorfinal, quantidade,
         link_referencia, link_compra, comprado, prioridade
  FROM produtos
  WHERE id = ?
`);

const insertOne = db.prepare(`
  INSERT INTO produtos
    (nome, categoria, orcamento, valorfinal, quantidade,
     link_referencia, link_compra, comprado, prioridade)
  VALUES
    (@nome, @categoria, @orcamento, @valorfinal, @quantidade,
     @link_referencia, @link_compra, @comprado, @prioridade)
`);

const deleteById = db.prepare(`DELETE FROM produtos WHERE id = ?`);

// --- helpers de normalização (garantem tipos aceitos pelo SQLite) ---
function toNumberOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toIntOrDefault(v, d = 1) {
  if (v === '' || v === undefined || v === null) return d;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}
function to01(v) { return v ? 1 : 0; }
function strOrNull(v) {
  if (v === '' || v === undefined) return null;
  return v ?? null;
}
function normalizeFull(p) {
  return {
    nome: p.nome,
    categoria: p.categoria ?? null,
    orcamento: toNumberOrNull(p.orcamento),
    valorfinal: toNumberOrNull(p.valorfinal),
    quantidade: toIntOrDefault(p.quantidade, 1),
    link_referencia: strOrNull(p.link_referencia),
    link_compra:     strOrNull(p.link_compra),
    comprado:   to01(p.comprado),
    prioridade: to01(p.prioridade),
  };
}
// para PATCH: só normaliza o que veio no objeto
function normalizePartial(fields) {
  const out = {};
  if ('nome' in fields) out.nome = fields.nome;
  if ('categoria' in fields) out.categoria = fields.categoria ?? null;
  if ('orcamento' in fields) out.orcamento = toNumberOrNull(fields.orcamento);
  if ('valorfinal' in fields) out.valorfinal = toNumberOrNull(fields.valorfinal);
  if ('quantidade' in fields) out.quantidade = toIntOrDefault(fields.quantidade, 1);
  if ('link_referencia' in fields) out.link_referencia = strOrNull(fields.link_referencia);
  if ('link_compra' in fields) out.link_compra = strOrNull(fields.link_compra);
  if ('comprado' in fields) out.comprado = to01(fields.comprado);
  if ('prioridade' in fields) out.prioridade = to01(fields.prioridade);
  return out;
}

function buildPatch(fields) {
  const allowed = [
    'nome','categoria','orcamento','valorfinal','quantidade',
    'link_referencia','link_compra','comprado','prioridade'
  ];
  const cols = [];
  const params = {};
  for (const k of allowed) {
    if (k in fields) { cols.push(`${k} = @${k}`); params[k] = fields[k]; }
  }
  if (!cols.length) return null;
  return { sql: `UPDATE produtos SET ${cols.join(', ')} WHERE id = @id`, params };
}

export default {
  list() { return selectAll.all(); },
  get(id) { return selectById.get(id); },

  create(payload) {
    // defaults + normalização
    const defaults = {
      categoria: null,
      orcamento: null,
      valorfinal: null,
      quantidade: 1,
      link_referencia: null,
      link_compra: null,
      comprado: 0,
      prioridade: 0,
    };
    const data = normalizeFull({ ...defaults, ...payload });
    const info = insertOne.run(data);
    return this.get(info.lastInsertRowid);
  },

  patch(id, fields) {
    const norm = normalizePartial(fields);
    const q = buildPatch(norm);
    if (!q) return this.get(id);
    const info = db.prepare(q.sql).run({ id, ...q.params });
    if (info.changes === 0) return null;
    return this.get(id);
  },

  remove(id) {
    return deleteById.run(id).changes > 0;
  }
};
