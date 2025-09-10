CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  preco_centavos INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  categoria TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);
