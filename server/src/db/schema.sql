PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS produtos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nome           VARCHAR(120) NOT NULL,
  categoria      VARCHAR(80),
  orcamento      FLOAT,
  valorfinal     FLOAT,
  quantidade     INTEGER,
  link_referencia VARCHAR(255),
  link_compra     VARCHAR(255),
  comprado       BOOLEAN NOT NULL DEFAULT 0,
  prioridade     BOOLEAN NOT NULL DEFAULT 0
);
