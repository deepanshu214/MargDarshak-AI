import { UserProfile } from "../types";

const DB_KEY = "margdarshak_database";

interface Database {
  users: Record<string, UserProfile>;
}

export const getDB = (): Database => {
  const data = localStorage.getItem(DB_KEY);
  if (!data || data.trim() === "") {
    return { users: {} };
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Database parsing error, resetting storage.", e);
    return { users: {} };
  }
};

const saveDB = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const databaseService = {
  // Sign up a new user
  registerUser: (userData: UserProfile): boolean => {
    const db = getDB();
    if (db.users[userData.email]) return false; // Already exists
    db.users[userData.email] = userData;
    saveDB(db);
    return true;
  },

  // Log in existing user
  loginUser: (email: string): UserProfile | null => {
    const db = getDB();
    return db.users[email] || null;
  },

  // Update specific user record
  updateUser: (email: string, updates: Partial<UserProfile>): UserProfile | null => {
    const db = getDB();
    if (!db.users[email]) return null;
    
    db.users[email] = { ...db.users[email], ...updates };
    saveDB(db);
    return db.users[email];
  },

  // Get all users (for leaderboard)
  getAllUsers: (): UserProfile[] => {
    const db = getDB();
    return Object.values(db.users);
  }
};