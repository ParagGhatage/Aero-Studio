// src/db.js
import Dexie from 'dexie';

export const db = new Dexie('LocalIMGDatabase');

// Define the schema
db.version(1).stores({
  images: '++id, name, album, orderIndex, createdAt' 
  // Note: We don't index the actual 'fileBlob' because binary data is too heavy to index.
  // We index the metadata so querying is lightning fast.
});