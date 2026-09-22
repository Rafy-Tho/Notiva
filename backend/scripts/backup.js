import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');
const TABLES = ['User', 'Notebook', 'Tag', 'Note', 'NoteTag'];

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const backupData = {
    timestamp,
    version: '1.0.0',
    database: 'postgresql',
    tables: {},
  };

  for (const table of TABLES) {
    const { rows } = await client.query(`SELECT * FROM "${table}"`);
    backupData.tables[table] = rows;
    console.log(`Backed up ${rows.length} rows from ${table}`);
  }

  await client.end();
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`Backup saved to ${backupFile}`);
}

backup().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
