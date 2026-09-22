import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');
const RESTORE_ORDER = ['User', 'Notebook', 'Tag', 'Note', 'NoteTag'];
const DELETE_ORDER = ['NoteTag', 'Note', 'Tag', 'Notebook', 'User'];

async function restore(backupFile) {
  if (!backupFile) {
    console.error('Usage: npm run restore <backup-file>');
    console.error('Example: npm run restore backups/backup-2025-01-15T10-30-00-000Z.json');
    process.exit(1);
  }

  const backupPath = path.isAbsolute(backupFile)
    ? backupFile
    : path.join(BACKUP_DIR, backupFile);

  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const tables = backup.tables || backup.collections || {};

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query('BEGIN');

    for (const table of DELETE_ORDER) {
      await client.query(`DELETE FROM "${table}"`);
    }

    for (const table of RESTORE_ORDER) {
      const rows = tables[table];
      if (!rows || rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const columnList = columns.map((c) => `"${c}"`).join(', ');
      const values = [];
      const placeholders = rows.map((row, rowIndex) => {
        const params = columns.map((column, columnIndex) => {
          values.push(row[column]);
          return `$${rowIndex * columns.length + columnIndex + 1}`;
        });
        return `(${params.join(', ')})`;
      });

      await client.query(
        `INSERT INTO "${table}" (${columnList}) VALUES ${placeholders.join(', ')}`,
        values,
      );
      console.log(`Restored ${rows.length} rows to ${table}`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }

  console.log('Restore complete');
}

const backupFile = process.argv[2];
restore(backupFile).catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
