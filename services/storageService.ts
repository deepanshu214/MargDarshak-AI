/**
 * High-Capacity Resilient Storage Service for MargDarshak AI
 *
 * Replaces the 5MB browser localStorage bottleneck with IndexedDB,
 * backed by an in-memory sync cache for instant render access and
 * fallback support.
 */

const DB_NAME = "MargDarshakDB";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

class ResilientStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== "undefined" && typeof window.indexedDB !== "undefined") {
      this.initIndexedDB().catch(() => {});
    }
  }

  private initIndexedDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn("IndexedDB failed to open, falling back to LocalStorage/Memory.", request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Synchronous get from memory cache (ideal for initial React render states)
   */
  public getSync<T>(key: string, defaultValue?: T): T | null {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    // Fallback to localStorage for synchronous bootstrapping if available
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          this.memoryCache.set(key, parsed);
          return parsed as T;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    return defaultValue !== undefined ? defaultValue : null;
  }

  /**
   * Asynchronous get with IndexedDB persistence
   */
  public async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        const db = await this.initIndexedDB();
        return new Promise<T | null>((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);

          req.onsuccess = () => {
            const val = req.result !== undefined ? req.result : null;
            if (val !== null) {
              this.memoryCache.set(key, val);
              resolve(val as T);
            } else {
              const fallback = this.getSync<T>(key, defaultValue);
              resolve(fallback);
            }
          };

          req.onerror = () => {
            resolve(this.getSync<T>(key, defaultValue));
          };
        });
      }
    } catch (e) {
      // Fallback
    }

    return this.getSync<T>(key, defaultValue);
  }

  /**
   * Asynchronous set with memory cache write-through and IndexedDB storage
   */
  public async set<T>(key: string, value: T): Promise<void> {
    this.memoryCache.set(key, value);

    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        const db = await this.initIndexedDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(value, key);

          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch (e) {
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (quotaError) {
          console.warn("Storage quota exceeded in fallback storage:", quotaError);
        }
      }
    }

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const str = JSON.stringify(value);
        if (str.length < 500000) {
          window.localStorage.setItem(key, str);
        }
      } catch (_) {}
    }
  }

  /**
   * Batch write for heavy load optimizations
   */
  public async setBatch(items: Record<string, any>): Promise<void> {
    for (const [k, v] of Object.entries(items)) {
      this.memoryCache.set(k, v);
    }

    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        const db = await this.initIndexedDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);

          for (const [k, v] of Object.entries(items)) {
            store.put(v, k);
          }

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (e) {
      console.warn("IndexedDB batch write error:", e);
    }
  }

  /**
   * Remove item
   */
  public async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        const db = await this.initIndexedDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch (e) {}

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  /**
   * Clear all storage
   */
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        const db = await this.initIndexedDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch (e) {}

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  }
}

export const storageService = new ResilientStorage();
