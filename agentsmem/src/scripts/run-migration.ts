import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS = ['000_first.sql'];

async function run(): Promise<void> {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
  });
  for (const name of MIGRATIONS) {
    const sql = readFileSync(join(__dirname, '../../migrations', name), 'utf-8');
    await conn.query(sql);
    console.log(`Migration ${name} applied.`);
  }
  await conn.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
