import Dexie from "dexie";

export const db = new Dexie("LocalIMGDatabase");

// Increment the version number and add the 'albums' table
db.version(2).stores({
  images: "++id, name, album, orderIndex, createdAt",
  albums: "++id, name, createdAt",
});
