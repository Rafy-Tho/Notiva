import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noteflow';
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');

async function restore(backupFile) {
  if (!backupFile) {
    console.error('Usage: npm run restore <backup-file>');
    console.error('Example: npm run restore backup/backups/backup-2025-01-15T10-30-00-000Z.json');
    process.exit(1);
  }

  const backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(BACKUP_DIR, backupFile);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  for (const [collectionName, docs] of Object.entries(backup.collections)) {
    if (docs.length === 0) continue;
    
    await db.collection(collectionName).deleteMany({});
    const result = await db.collection(collectionName).insertMany(docs);
    console.log(`Restored ${result.insertedCount} documents to ${collectionName}`);
  }

  await mongoose.disconnect();
  console.log('Restore complete');
}

const backupFile = process.argv[2];
restore(backupFile).catch(err => {
  console.error('Restore failed:', err);
  process.exit(1);
});
