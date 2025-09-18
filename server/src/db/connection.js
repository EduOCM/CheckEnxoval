// server/src/db/connection.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_FILE || path.resolve(__dirname, '../data.db');

// Liga logs de SQL (ajuda a debugar o 500) — pode desligar depois
const db = new Database(DB_PATH, { verbose: console.log });

console.log('[SQLite] usando arquivo:', DB_PATH);
export default db;
