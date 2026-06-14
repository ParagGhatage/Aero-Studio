import { GlobalMediaContext } from './GlobalMediaContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db'; 

export function GlobalMediaProvider({ children }) {
  const mediaData = {
    images: useLiveQuery(() => db.images.orderBy('createdAt').reverse().toArray()) || [],
    albums: useLiveQuery(() => db.albums.orderBy('createdAt').toArray()) || [],
  };

  return (
    <GlobalMediaContext.Provider value={mediaData}>
      {children}
    </GlobalMediaContext.Provider>
  );
}