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
  await migratePostsCache(db);
}

/** Nâng cấp CSDL cũ (Sprint 1) — bổ sung cột is_synced cho bảng posts_cache */
async function migratePostsCache(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(posts_cache);');
  if (columns.some((column) => column.name === 'is_synced')) return;
  await db.execAsync('ALTER TABLE posts_cache ADD COLUMN is_synced INTEGER NOT NULL DEFAULT 1;');
}
