import db from '../db/connection.js';

export function listarProdutos() {
  const stmt = db.prepare('SELECT * FROM produtos ORDER BY id DESC');
  return stmt.all();
}

export function obterProduto(id) {
  const stmt = db.prepare('SELECT * FROM produtos WHERE id = ?');
  return stmt.get(id);
}

export function criarProduto({ nome, preco_centavos, descricao, categoria }) {
  const stmt = db.prepare(
    `INSERT INTO produtos (nome, preco_centavos, descricao, categoria, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  );
  const info = stmt.run(nome, preco_centavos, descricao ?? null, categoria ?? null);
  return obterProduto(info.lastInsertRowid);
}

export function atualizarProduto(id, patch) {
  const atual = obterProduto(id);
  if (!atual) return null;

  const campos = {
    nome: patch.nome ?? atual.nome,
    preco_centavos: patch.preco_centavos ?? atual.preco_centavos,
    descricao: patch.descricao ?? atual.descricao,
    categoria: patch.categoria ?? atual.categoria
  };

  const stmt = db.prepare(
    `UPDATE produtos
     SET nome = ?, preco_centavos = ?, descricao = ?, categoria = ?, updated_at = datetime('now')
     WHERE id = ?`
  );
  stmt.run(campos.nome, campos.preco_centavos, campos.descricao, campos.categoria, id);
  return obterProduto(id);
}

export function deletarProduto(id) {
  const stmt = db.prepare('DELETE FROM produtos WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}
