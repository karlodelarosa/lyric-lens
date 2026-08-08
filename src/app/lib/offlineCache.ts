const DB_NAME = "lyric-lens-offline";
const DB_VERSION = 1;
const SETLISTS_STORE = "setlists";
const SONGS_STORE = "songs";

export interface OfflineSongSection {
  id: string;
  type: string;
  number?: number;
  lyrics: string;
  intensity?: number | null;
}

export interface OfflineSong {
  id: string;
  title: string;
  artist: string;
  sections: OfflineSongSection[];
  tags: string[];
  usageCount: number;
  backgroundVideoUrl: string | null;
}

export interface OfflineSetlist {
  id: string;
  name: string;
  songs: string[];
  flowSections: { name: string; songIds: string[] }[];
  welcomeSlide: { url: string; type: "image" | "video" } | null;
  updatedAt?: string | null;
}

interface CachedSetlistRecord {
  key: string;
  orgId: string;
  setlistId: string;
  setlist: OfflineSetlist;
  cachedAt: string;
}

interface CachedSongRecord {
  key: string;
  orgId: string;
  songId: string;
  song: OfflineSong;
  cachedAt: string;
}

function setlistKey(orgId: string, setlistId: string) {
  return `${orgId}:${setlistId}`;
}

function songKey(orgId: string, songId: string) {
  return `${orgId}:${songId}`;
}

export function collectSongIdsFromSetlist(setlist: OfflineSetlist): string[] {
  const ids = new Set<string>(setlist.songs);
  for (const section of setlist.flowSections) {
    for (const songId of section.songIds) {
      ids.add(songId);
    }
  }
  return Array.from(ids);
}

export function dedupeSongsById(songs: OfflineSong[]): OfflineSong[] {
  const byId = new Map<string, OfflineSong>();
  for (const song of songs) {
    byId.set(song.id, song);
  }
  return Array.from(byId.values());
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open offline cache"));
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SETLISTS_STORE)) {
        const store = db.createObjectStore(SETLISTS_STORE, { keyPath: "key" });
        store.createIndex("orgId", "orgId", { unique: false });
      }
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        const store = db.createObjectStore(SONGS_STORE, { keyPath: "key" });
        store.createIndex("orgId", "orgId", { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDatabase().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = operation(store);

        tx.oncomplete = () => {
          db.close();
          if (request instanceof IDBRequest) {
            resolve(request.result as T);
          } else {
            resolve();
          }
        };

        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("Offline cache transaction failed"));
        };
      }),
  );
}

function getAllByOrgId<T extends { orgId: string }>(
  storeName: string,
  orgId: string,
): Promise<T[]> {
  return openDatabase().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const index = store.index("orgId");
        const request = index.getAll(orgId);

        request.onsuccess = () => {
          resolve((request.result as T[]) ?? []);
        };

        request.onerror = () => {
          reject(request.error ?? new Error("Failed to read offline cache"));
        };

        tx.oncomplete = () => {
          db.close();
        };

        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("Failed to read offline cache"));
        };
      }),
  );
}

export async function saveSetlistOffline(
  orgId: string,
  setlist: OfflineSetlist,
  songs: OfflineSong[],
): Promise<void> {
  const cachedAt = new Date().toISOString();
  const requiredSongIds = collectSongIdsFromSetlist(setlist);
  const songsById = new Map(songs.map((song) => [song.id, song]));

  for (const songId of requiredSongIds) {
    if (!songsById.has(songId)) {
      throw new Error(`Missing song data for offline cache: ${songId}`);
    }
  }

  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([SETLISTS_STORE, SONGS_STORE], "readwrite");
    const setlistStore = tx.objectStore(SETLISTS_STORE);
    const songStore = tx.objectStore(SONGS_STORE);

    setlistStore.put({
      key: setlistKey(orgId, setlist.id),
      orgId,
      setlistId: setlist.id,
      setlist,
      cachedAt,
    } satisfies CachedSetlistRecord);

    for (const songId of requiredSongIds) {
      const song = songsById.get(songId)!;
      songStore.put({
        key: songKey(orgId, songId),
        orgId,
        songId,
        song,
        cachedAt,
      } satisfies CachedSongRecord);
    }

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to save offline setlist"));
    };
  });
}

export async function getOfflineSetlists(orgId: string): Promise<OfflineSetlist[]> {
  const records = await getAllByOrgId<CachedSetlistRecord>(SETLISTS_STORE, orgId);
  return records.map((record) => record.setlist);
}

export async function getOfflineSongs(orgId: string): Promise<OfflineSong[]> {
  const records = await getAllByOrgId<CachedSongRecord>(SONGS_STORE, orgId);
  return dedupeSongsById(records.map((record) => record.song));
}

export async function getOfflineSongsForSetlist(
  orgId: string,
  setlistId: string,
): Promise<OfflineSong[]> {
  const setlist = await getOfflineSetlist(orgId, setlistId);
  if (!setlist) return [];

  const allSongs = await getOfflineSongs(orgId);
  const songIds = new Set(collectSongIdsFromSetlist(setlist));
  return allSongs.filter((song) => songIds.has(song.id));
}

export async function getOfflineSetlist(
  orgId: string,
  setlistId: string,
): Promise<OfflineSetlist | null> {
  const record = await runTransaction<CachedSetlistRecord | undefined>(
    SETLISTS_STORE,
    "readonly",
    (store) => store.get(setlistKey(orgId, setlistId)),
  );
  return record?.setlist ?? null;
}

export async function isSetlistOffline(
  orgId: string,
  setlistId: string,
): Promise<boolean> {
  const setlist = await getOfflineSetlist(orgId, setlistId);
  return setlist !== null;
}

export async function getOfflineSetlistIds(orgId: string): Promise<string[]> {
  const setlists = await getOfflineSetlists(orgId);
  return setlists.map((setlist) => setlist.id);
}

export async function removeSetlistOffline(
  orgId: string,
  setlistId: string,
): Promise<void> {
  const setlist = await getOfflineSetlist(orgId, setlistId);
  if (!setlist) return;

  const songIds = collectSongIdsFromSetlist(setlist);
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([SETLISTS_STORE, SONGS_STORE], "readwrite");
    const setlistStore = tx.objectStore(SETLISTS_STORE);
    const songStore = tx.objectStore(SONGS_STORE);

    setlistStore.delete(setlistKey(orgId, setlistId));

    for (const songId of songIds) {
      songStore.delete(songKey(orgId, songId));
    }

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to remove offline setlist"));
    };
  });
}

export function isBrowserOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
