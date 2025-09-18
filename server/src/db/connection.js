// src/db/connection.js
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Prioridade: variável de ambiente DB_FILE. Senão, usa o data.db da raiz do projeto.
const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.resolve(__dirname, '..', 'data.db'); // <-- raiz (um nível acima de src)

console.log('[SQLite] usando arquivo:', DB_FILE);

const db = new Database(DB_FILE);
export default db;
