import { getDatabase } from './database';
import { SyncAction, SyncQueueItem, SyncTableName } from '@/domain/entities/sync';

interface SyncQueueRow {
  id: string;
  table_name: SyncTableName;
  action: SyncAction;
  payload_json: string;
  created_at: number;
  retry_count: number;
}

/** Thao tác trên bảng sync_queue — hàng đợi các thay đổi chưa đẩy được lên Firestore */
export class SyncQueueLocalDataSource {
  async enqueue(
    tableName: SyncTableName,
    action: SyncAction,
    payload: object
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: `${tableName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tableName,
      action,
      payloadJson: JSON.stringify(payload),
      createdAt: Date.now(),
      retryCount: 0,
    };

    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_queue (id, table_name, action, payload_json, created_at, retry_count)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.tableName, item.action, item.payloadJson, item.createdAt, item.retryCount]
    );
    return item;
  }

  async getPending(limitCount: number = 50): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SyncQueueRow>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT ?',
      [limitCount]
    );
    return rows.map((row) => ({
      id: row.id,
      tableName: row.table_name,
      action: row.action,
      payloadJson: row.payload_json,
      createdAt: row.created_at,
      retryCount: row.retry_count,
    }));
  }

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  async incrementRetry(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?', [id]);
  }

  async countPending(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM sync_queue');
    return row?.total ?? 0;
  }
}
