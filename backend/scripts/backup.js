import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noteflow';
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = ['users', 'notes', 'notebooks', 'tags'];
  const backup = {
    timestamp,
    version: '1.0.0',
    collections: {}
  };

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const docs = await collection.find().toArray();
    backup.collections[collectionName] = docs;
    console.log(`Backed up ${docs.length} documents from ${collectionName}`);
  }

  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`Backup saved to ${backupFile}`);

  await mongoose.disconnect();
  console.log('Backup complete');
}

backup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
