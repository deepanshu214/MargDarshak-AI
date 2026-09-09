import { UserProfile } from "../types";
import { storageService } from "./storageService";

const DB_KEY = "margdarshak_database";

export interface Database {
  users: Record<string, UserProfile>;
  sessions?: Record<string, any>;
  lastSyncedAt?: string;
}

// In-memory cache for ultra-fast synchronous rendering and fallback
let cachedDB: Database | null = null;

export const getDB = (): Database => {
  if (cachedDB) return cachedDB;

  const data = storageService.getSync<Database>(DB_KEY);
  if (data && data.users) {
    cachedDB = data;
    return cachedDB;
  }

  // Initial fallback to localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users) {
          cachedDB = parsed;
          return cachedDB;
        }
      }
    } catch (e) {
      console.warn("Database parsing error from localStorage.", e);
    }
  }

  cachedDB = { users: {} };
  return cachedDB;
};

const persistDB = (db: Database) => {
  cachedDB = db;
  // Non-blocking durable write to high-capacity storage
  storageService.set(DB_KEY, db).catch((err) => {
    console.error("Failed to persist database to storage engine:", err);
  });
};

export const databaseService = {
  /**
   * Sign up a new user
   */
  registerUser: (userData: UserProfile): boolean => {
    const db = getDB();
    if (db.users[userData.email]) return false; // User already exists
    
    db.users[userData.email] = {
      ...userData,
      testHistory: userData.testHistory || [],
      answeredQuestionIds: userData.answeredQuestionIds || [],
      verifiedDocuments: userData.verifiedDocuments || {}
    };
    persistDB(db);
    return true;
  },

  /**
   * Log in existing user
   */
  loginUser: (email: string): UserProfile | null => {
    const db = getDB();
    return db.users[email] || null;
  },

  /**
   * Update specific user record
   */
  updateUser: (email: string, updates: Partial<UserProfile>): UserProfile | null => {
    const db = getDB();
    if (!db.users[email]) return null;

    db.users[email] = {
      ...db.users[email],
      ...updates
    };
    persistDB(db);
    return db.users[email];
  },

  /**
   * Get all users (used for leaderboard and aggregate stats)
   */
  getAllUsers: (): UserProfile[] => {
    const db = getDB();
    return Object.values(db.users);
  },

  /**
   * Batch insert users for stress tests and data migrations
   */
  batchRegisterUsers: (userList: UserProfile[]): void => {
    const db = getDB();
    for (const u of userList) {
      db.users[u.email] = u;
    }
    persistDB(db);
  },

  /**
   * Get total user count
   */
  getUserCount: (): number => {
    const db = getDB();
    return Object.keys(db.users).length;
  },

  /**
   * Reset database (for testing or user wipe)
   */
  clearDatabase: (): void => {
    cachedDB = { users: {} };
    storageService.remove(DB_KEY).catch(() => {});
  }
};