export interface SQLiteExecutor {
  execAsync: (sql: string) => Promise<void>;
}

export const tripMateSchema = [
  `CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY NOT NULL,
    creator_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    destinations_json TEXT NOT NULL DEFAULT '[]',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    budget_total REAL NOT NULL DEFAULT 0,
    spent_total REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0,
    is_synced INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    day_index INTEGER NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    location_name TEXT,
    estimated_cost REAL NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    is_synced INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    expense_date TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    is_from_ocr INTEGER NOT NULL DEFAULT 0,
    receipt_image_url TEXT,
    split_member_uids_json TEXT NOT NULL DEFAULT '[]',
    is_synced INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS posts_cache (
    id TEXT PRIMARY KEY NOT NULL,
    author_uid TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    destination_tag TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    is_synced INTEGER NOT NULL DEFAULT 1
  );`,
  `CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    table_name TEXT NOT NULL CHECK (table_name IN ('trips', 'activities', 'expenses', 'posts_cache')),
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0
  );`,
  'CREATE INDEX IF NOT EXISTS idx_activities_trip_day ON activities(trip_id, day_index);',
  'CREATE INDEX IF NOT EXISTS idx_expenses_trip_date ON expenses(trip_id, expense_date);',
  'CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);',
];

export async function initializeTripMateDatabase(database: SQLiteExecutor): Promise<void> {
  await database.execAsync('PRAGMA foreign_keys = ON;');
  for (const statement of tripMateSchema) {
    await database.execAsync(statement);
  }
}
