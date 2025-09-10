import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data.db');
const db = new Database(DB_PATH);

// Cria/atualiza schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Seed inicial (ignora erros se já inserido)
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
  try {
    const seed = fs.readFileSync(seedPath, 'utf8');
    db.exec(seed);
  } catch {}
}

export default db;
