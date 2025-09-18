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
  FROM produtos WHERE id = ?
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

function buildPatch(fields) {
  const allowed = [
    'nome','categoria','orcamento','valorfinal','quantidade',
    'link_referencia','link_compra','comprado','prioridade'
  ];
  const cols = [];
  const params = {};
  for (const k of allowed) if (k in fields) { cols.push(`${k} = @${k}`); params[k] = fields[k]; }
  if (!cols.length) return null;
  return { sql: `UPDATE produtos SET ${cols.join(', ')} WHERE id = @id`, params };
}

export default {
  list() { return selectAll.all(); },
  get(id) { return selectById.get(id); },
  create(payload) {
    const data = {
      categoria: null,
      orcamento: null,
      valorfinal: null,
      quantidade: 1,
      link_referencia: null,
      link_compra: null,
      comprado: 0,
      prioridade: 0,
      ...payload
    };
    const info = insertOne.run(data);
    return this.get(info.lastInsertRowid);
  },
  patch(id, fields) {
    const q = buildPatch(fields);
    if (!q) return this.get(id);
    const info = db.prepare(q.sql).run({ id, ...q.params });
    if (info.changes === 0) return null;
    return this.get(id);
  },
  remove(id) {
    return deleteById.run(id).changes > 0;
  }
};
