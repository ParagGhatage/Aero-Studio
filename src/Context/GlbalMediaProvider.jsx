import { GlobalMediaContext } from "./GlobalMediaContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { useMemo } from "react";

export function GlobalMediaProvider({ children }) {
  // These hooks automatically subscribe to database changes.
  // They return undefined initially, then the data once loaded.
  const images =
    useLiveQuery(() => db.images.orderBy("createdAt").reverse().toArray()) ??
    [];
  const albums =
    useLiveQuery(() => db.albums.orderBy("createdAt").toArray()) ?? [];

  // Memoizing the value object prevents downstream components
  // from re-rendering unless the data actually changes.
  const mediaData = useMemo(
    () => ({
      images,
      albums,
    }),
    [images, albums],
  );

  return (
    <GlobalMediaContext.Provider value={mediaData}>
      {children}
    </GlobalMediaContext.Provider>
  );
}
