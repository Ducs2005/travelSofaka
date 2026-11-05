/**
 * SQLite DDL Schema for Travelsofaka
 * Supports Offline-First data storage and sync_queue mechanism
 */

export const CREATE_TRIPS_TABLE = `
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY NOT NULL,
    creator_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    destinations TEXT NOT NULL, -- JSON array of strings
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    budget_total REAL NOT NULL,
    spent_total REAL NOT NULL DEFAULT 0,
    joined_member_uids TEXT NOT NULL, -- JSON array of strings
    is_active INTEGER NOT NULL DEFAULT 1,
    is_synced INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
`;

export const CREATE_ACTIVITIES_TABLE = `
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    day_index INTEGER NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    location_name TEXT,
    estimated_cost REAL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );
`;

export const CREATE_EXPENSES_TABLE = `
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    is_from_ocr INTEGER NOT NULL DEFAULT 0,
    receipt_image_url TEXT,
    split_member_uids TEXT NOT NULL, -- JSON array of strings
    is_synced INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );
`;

export const CREATE_POSTS_CACHE_TABLE = `
  CREATE TABLE IF NOT EXISTS posts_cache (
    id TEXT PRIMARY KEY NOT NULL,
    author_uid TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    destination_tag TEXT NOT NULL,
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    time_ago TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;

export const CREATE_SYNC_QUEUE_TABLE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;
