import * as SQLite from 'expo-sqlite';
import {
  CREATE_TRIPS_TABLE,
  CREATE_ACTIVITIES_TABLE,
  CREATE_EXPENSES_TABLE,
  CREATE_POSTS_CACHE_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
} from './schema';

const DATABASE_NAME = 'travelsofaka.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    ${CREATE_TRIPS_TABLE}
    ${CREATE_ACTIVITIES_TABLE}
    ${CREATE_EXPENSES_TABLE}
    ${CREATE_POSTS_CACHE_TABLE}
    ${CREATE_SYNC_QUEUE_TABLE}
  `);
}
