export type SyncTableName = 'trips' | 'expenses' | 'posts';
export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

/** Một bản ghi trong bảng sync_queue của SQLite (hàng đợi đồng bộ ngoại tuyến) */
export interface SyncQueueItem {
  id: string;
  tableName: SyncTableName;
  action: SyncAction;
  payloadJson: string;
  createdAt: number;
  retryCount: number;
}

/** Kết quả một lượt chạy của Sync Engine */
export interface SyncResult {
  pushed: number;
  failed: number;
  remaining: number;
}
